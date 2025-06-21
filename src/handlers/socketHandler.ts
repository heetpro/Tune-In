import { User } from "@/models/User";
import jwt from "jsonwebtoken";
import { Server } from "http";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import Match from "@/models/Match";
import type { ServerWebSocket } from "bun";
import { ChatService } from "@/services/ChatService";
import type { MessagePayload, MessageReadPayload, TypingPayload, ConversationCreatePayload, WebSocketData } from "@/types";

// Define a type for typing users in a conversation
type TypingUsersMap = Map<string, { userId: string; displayName: string; timestamp: number }[]>;

export class SocketHandler {
    private server: Server;
    private connectedUsers: Map<string, ServerWebSocket<WebSocketData>> = new Map();
    private typingUsers: TypingUsersMap = new Map();

    constructor(server: Server) {
        this.server = server;
        this.setupWebSocketServer();
    }

    private setupWebSocketServer() {
        // Use environment variable or fallback to a different port (3002)
        const wsPort = parseInt(process.env.WEBSOCKET_PORT || '3002', 10);
        
        Bun.serve({
            port: wsPort,
            fetch: (req, server) => {
                // Extract URL and token from query string
                const url = new URL(req.url);
                const token = url.searchParams.get('token');

                // Check WebSocket upgrade
                if (server.upgrade(req, {
                    data: { token: token || '' }
                })) {
                    return; // Return nothing, as the request has been upgraded
                }
                
                return new Response("Upgrade failed", { status: 400 });
            },
            websocket: {
                message: (ws, message) => this.handleMessage(ws as ServerWebSocket<WebSocketData>, message),
                open: (ws) => this.handleConnection(ws as ServerWebSocket<WebSocketData>),
                close: (ws, code, reason) => this.handleDisconnection(ws as ServerWebSocket<WebSocketData>, code, reason),
                drain: (ws) => {
                    console.log("WebSocket backpressure drained");
                }
            }
        });
        
        console.log(`WebSocket server started on port ${wsPort}`);
    }

    private async handleConnection(ws: ServerWebSocket<WebSocketData>) {
        try {
            const token = ws.data.token;
              
              if (!token) {
                ws.close(1008, 'Authentication required');
                return;
              }
      
            // Verify token
              const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
              const user = await User.findById(decoded.id);
      
              if (!user) {
                ws.close(1008, 'User not found');
                return;
            }

            // Store user data with the WebSocket
            ws.data.userData = user;

            console.log(`User ${user.displayName} connected`);
            this.connectedUsers.set(user._id.toString(), ws);
      
            // Update user status
            await User.findByIdAndUpdate(user._id, {
              isOnline: true,
              lastSeen: new Date()
            });
      
            // Find conversations and subscribe user
            const conversations = await Conversation.find({
              participants: user._id.toString(),
              isActive: true
            });
      
            // Store conversation IDs with the WebSocket for cleanup
            ws.data.conversations = conversations.map(conv => conv._id.toString());
            
            // Send connected confirmation
            this.sendToClient(ws, 'connected', { userId: user._id.toString() });

            // Notify other users that this user is online
            this.broadcastUserStatus(user._id.toString(), true);

            // Send user conversations
            const userConversations = await ChatService.getUserConversations(user._id.toString());
            this.sendToClient(ws, 'conversations', userConversations);
        } catch (error) {
            console.error('WebSocket connection error:', error);
            ws.close(1011, 'Server error during connection setup');
        }
    }

    private async handleDisconnection(ws: ServerWebSocket<WebSocketData>, code: number, reason: string) {
        const user = ws.data.userData;
        if (!user) return;

        console.log(`User ${user.displayName} disconnected`);
        
        this.connectedUsers.delete(user._id.toString());

        // Update user status
        await User.findByIdAndUpdate(user._id, {
            isOnline: false,
            lastSeen: new Date()
        });

        // Clear typing status
        this.clearUserTypingStatus(user._id.toString());

        // Notify other users that this user is offline
        this.broadcastUserStatus(user._id.toString(), false);
    }

    private async handleMessage(ws: ServerWebSocket<WebSocketData>, rawMessage: string | Uint8Array) {
        try {
            const user = ws.data.userData;
            if (!user) {
                this.sendToClient(ws, 'error', { message: 'Not authenticated' });
                return;
            }

            const message = JSON.parse(rawMessage.toString());
            const { type, payload } = message;

            switch (type) {
                case 'send_message':
                    await this.handleSendMessage(ws, user, payload as MessagePayload);
                    break;
                case 'mark_read':
                    await this.handleMarkRead(ws, user, payload as MessageReadPayload);
                    break;
                case 'typing_start':
                    this.handleTypingStart(ws, user, payload as TypingPayload);
                    break;
                case 'typing_stop':
                    this.handleTypingStop(ws, user, payload as TypingPayload);
                    break;
                case 'create_conversation':
                    await this.handleCreateConversation(ws, user, payload as ConversationCreatePayload);
                    break;
                case 'get_messages':
                    await this.handleGetMessages(ws, user, payload);
                    break;
                default:
                    this.sendToClient(ws, 'error', { message: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
            this.sendToClient(ws, 'error', { message: 'Failed to process message' });
        }
    }

    private async handleSendMessage(ws: ServerWebSocket<WebSocketData>, user: any, data: MessagePayload) {
              try {
                const { conversationId, content, messageType = 'text' } = data;
      
                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.includes(user._id.toString())) {
                this.sendToClient(ws, 'error', { message: 'Unauthorized' });
                  return;
                }

                // Get the other participant
            const otherParticipantIds = conversation.participants.filter(
                  p => p !== user._id.toString()
                );
                
            if (otherParticipantIds.length === 0) {
                this.sendToClient(ws, 'error', { message: 'Invalid conversation participants' });
                  return;
                }
                
                // Verify users can chat (are friends or have a match)
            for (const otherParticipantId of otherParticipantIds) {
                const canChat = await ChatService.canUsersChat(user._id.toString(), otherParticipantId);
                if (!canChat) {
                    this.sendToClient(ws, 'error', { 
                    message: 'Cannot send messages. Users must be friends or have a match'
                  });
                  return;
                }
                }
      
            // Send the message using ChatService
            const message = await ChatService.sendMessage({
                  conversationId,
                  senderId: user._id.toString(),
                  content,
                messageType
            });

            // Broadcast the message to all participants in conversation
            this.broadcastToConversation(conversationId, 'new_message', message);

            // Check if other participants are online to mark as delivered
            const onlineParticipants = otherParticipantIds.filter(id => this.connectedUsers.has(id));
      
                if (onlineParticipants.length > 0) {
                await ChatService.markMessageAsDelivered(message._id);
      
                this.broadcastToConversation(conversationId, 'message_delivered', {
                    messageId: message._id,
                    deliveredAt: new Date()
                  });
                }
      
            // Clear typing indicator for sender
            this.handleTypingStop(ws, user, { conversationId });

              } catch (error) {
                console.error('Error sending message:', error);
            this.sendToClient(ws, 'error', { message: 'Failed to send message' });
        }
              }
      
    private async handleMarkRead(ws: ServerWebSocket<WebSocketData>, user: any, data: MessageReadPayload) {
              try {
            const { messageId, conversationId } = data;
                
            await ChatService.markMessageAsRead(messageId, user._id.toString());
      
            // Notify others in conversation
            this.broadcastToConversation(conversationId, 'message_read', {
                    messageId,
                    readAt: new Date(),
                    readBy: user._id.toString()
            }, user._id.toString());
              } catch (error) {
                console.error('Error marking message as read:', error);
            this.sendToClient(ws, 'error', { message: 'Failed to mark message as read' });
        }
    }

    private handleTypingStart(ws: ServerWebSocket<WebSocketData>, user: any, data: TypingPayload) {
        try {
            const { conversationId } = data;
            
            // Add user to typing users for this conversation
            if (!this.typingUsers.has(conversationId)) {
                this.typingUsers.set(conversationId, []);
            }
            
            const typingUsersInConv = this.typingUsers.get(conversationId)!;
            const existingIndex = typingUsersInConv.findIndex(u => u.userId === user._id.toString());
            
            if (existingIndex >= 0) {
                // Update timestamp
                typingUsersInConv[existingIndex].timestamp = Date.now();
            } else {
                // Add new typing user
                typingUsersInConv.push({
                    userId: user._id.toString(),
                    displayName: user.displayName,
                    timestamp: Date.now()
                });
            }
            
            // Broadcast to others
            this.broadcastToConversation(conversationId, 'user_typing', {
                userId: user._id.toString(),
                displayName: user.displayName,
                timestamp: Date.now()
            }, user._id.toString());
        } catch (error) {
            console.error('Error handling typing start:', error);
        }
    }

    private handleTypingStop(ws: ServerWebSocket<WebSocketData>, user: any, data: TypingPayload) {
        try {
              const { conversationId } = data;
            
            // Remove user from typing users
            if (this.typingUsers.has(conversationId)) {
                const typingUsersInConv = this.typingUsers.get(conversationId)!;
                const updatedTypingUsers = typingUsersInConv.filter(u => u.userId !== user._id.toString());
                
                if (updatedTypingUsers.length === 0) {
                    this.typingUsers.delete(conversationId);
                } else {
                    this.typingUsers.set(conversationId, updatedTypingUsers);
                }
            }
            
            // Broadcast to others
            this.broadcastToConversation(conversationId, 'user_stopped_typing', {
                userId: user._id.toString()
            }, user._id.toString());
        } catch (error) {
            console.error('Error handling typing stop:', error);
        }
    }

    private async handleCreateConversation(ws: ServerWebSocket<WebSocketData>, user: any, data: ConversationCreatePayload) {
        try {
            const { participantIds } = data;
            
            // Create or get existing conversation
            const conversation = await ChatService.createOrGetConversation([
                user._id.toString(),
                ...participantIds
            ]);
            
            // Add this conversation to user's subscribed conversations
            if (!ws.data.conversations) {
                ws.data.conversations = [];
            }
            
            if (!ws.data.conversations.includes(conversation._id.toString())) {
                ws.data.conversations.push(conversation._id.toString());
            }
            
            // Send conversation details to the requester
            this.sendToClient(ws, 'conversation_created', conversation);
            
            // Notify other participants if they're online
            participantIds.forEach(participantId => {
                if (this.connectedUsers.has(participantId)) {
                    const participantWs = this.connectedUsers.get(participantId)!;
                    
                    // Add conversation to their subscription list
                    if (!participantWs.data.conversations) {
                        participantWs.data.conversations = [];
                    }
                    
                    if (!participantWs.data.conversations.includes(conversation._id.toString())) {
                        participantWs.data.conversations.push(conversation._id.toString());
                    }
                    
                    // Send them the conversation details
                    this.sendToClient(participantWs, 'conversation_created', conversation);
                }
            });
        } catch (error) {
            console.error('Error creating conversation:', error);
            this.sendToClient(ws, 'error', { message: 'Failed to create conversation' });
        }
    }

    private async handleGetMessages(ws: ServerWebSocket<WebSocketData>, user: any, data: any) {
        try {
            const { conversationId, page = 1, limit = 50 } = data;
            
            // Verify user is part of this conversation
            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: user._id.toString(),
                isActive: true
            });
            
            if (!conversation) {
                this.sendToClient(ws, 'error', { message: 'Conversation not found or access denied' });
                return;
            }
            
            const messages = await ChatService.getMessages(conversationId, page, limit);
            this.sendToClient(ws, 'messages', { conversationId, messages, page, limit });
        } catch (error) {
            console.error('Error fetching messages:', error);
            this.sendToClient(ws, 'error', { message: 'Failed to fetch messages' });
        }
    }

    private sendToClient(ws: ServerWebSocket<WebSocketData>, type: string, payload: any) {
        try {
            ws.send(JSON.stringify({ type, payload }));
        } catch (error) {
            console.error('Error sending to client:', error);
        }
    }

    private broadcastToConversation(conversationId: string, type: string, payload: any, excludeUserId?: string) {
        for (const [userId, ws] of this.connectedUsers.entries()) {
            // Skip excluded user
            if (excludeUserId && userId === excludeUserId) continue;
            
            // Check if user is in this conversation
            const userConversations = ws.data.conversations || [];
            if (userConversations.includes(conversationId)) {
                this.sendToClient(ws, type, payload);
            }
        }
    }

    private broadcastUserStatus(userId: string, isOnline: boolean) {
        const eventType = isOnline ? 'user_online' : 'user_offline';
        const payload = {
            userId,
            timestamp: new Date(),
        };

        // Broadcast to all connected users except the user themselves
        for (const [otherUserId, ws] of this.connectedUsers.entries()) {
            if (otherUserId !== userId) {
                this.sendToClient(ws, eventType, payload);
            }
        }
    }

    private clearUserTypingStatus(userId: string) {
        // Remove user from all typing lists
        this.typingUsers.forEach((users, conversationId) => {
            const updatedUsers = users.filter(u => u.userId !== userId);
            
            if (updatedUsers.length === 0) {
                this.typingUsers.delete(conversationId);
            } else {
                this.typingUsers.set(conversationId, updatedUsers);
            }
            
            // Notify others that user stopped typing
            this.broadcastToConversation(conversationId, 'user_stopped_typing', {
                userId
            }, userId);
        });
      }
}

