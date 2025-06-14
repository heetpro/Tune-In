import { User } from "@/models/User";
import jwt from "jsonwebtoken";
import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import Match from "@/models/Match";


export class SocketHandler {
    private io: SocketIOServer;
    private connectedUsers: Map<string, string> = new Map();

    constructor(server: Server) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
                methods: ['GET', 'POST'],
                credentials: true
              }
        });

        this.setupAuthentication();
        this.setupEventHandlers();
    }


    private setupAuthentication() {
        this.io.use(async (socket, next) => {
            try {
              const token = socket.handshake.auth.token;
              
              if (!token) {
                return next(new Error('Authentication error'));
              }
      
              const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
              const user = await User.findById(decoded.id);
      
              if (!user) {
                return next(new Error('User not found'));
              }
      
              socket.data.user = user;
              next();
            } catch (error) {
              next(new Error('Authentication error'));
            }
          });
    }

    private setupEventHandlers() {
        this.io.on('connection', async (socket) => {
            const user = socket.data.user;
            console.log(`User ${user.displayName} connected`);
      
            this.connectedUsers.set(user._id.toString(), socket.id);
      
            await User.findByIdAndUpdate(user._id, {
              isOnline: true,
              lastSeen: new Date()
            });
      
            const conversations = await Conversation.find({
              participants: user._id.toString(),
              isActive: true
            });
      
            conversations.forEach(conv => {
              socket.join(conv._id.toString());
            });
      
            socket.on('send_message', async (data) => {
              try {
                const { conversationId, content, messageType = 'text' } = data;
      
                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.includes(user._id.toString())) {
                  socket.emit('error', { message: 'Unauthorized' });
                  return;
                }

                // Get the other participant
                const otherParticipantId = conversation.participants.find(
                  p => p !== user._id.toString()
                );
                
                if (!otherParticipantId) {
                  socket.emit('error', { message: 'Invalid conversation participants' });
                  return;
                }
                
                // Verify users can chat (are friends or have a match)
                const currentUser = await User.findById(user._id);
                const areFriends = currentUser?.friends.includes(otherParticipantId);
                
                const match = await Match.findOne({
                  $or: [
                    { user1Id: user._id.toString(), user2Id: otherParticipantId },
                    { user1Id: otherParticipantId, user2Id: user._id.toString() }
                  ],
                  status: 'accepted'
                });
                
                const haveMatch = !!match;
                
                if (!areFriends && !haveMatch) {
                  socket.emit('error', { 
                    message: 'Cannot send messages. Users must be friends or have a match'
                  });
                  return;
                }
      
                const message = new Message({
                  conversationId,
                  senderId: user._id.toString(),
                  content,
                  messageType,
                  isRead: false,
                  isDelivered: false,
                  sentAt: new Date(),
                  isDeleted: false
                });
      
                await message.save();
                await message.populate('senderId', 'displayName profilePicture');
      
                await Conversation.findByIdAndUpdate(conversationId, {
                  lastMessage: {
                    content,
                    sentAt: message.sentAt,
                    senderId: user._id.toString()
                  },
                  lastActivity: new Date(),
                  $inc: { messageCount: 1 },
                  updatedAt: new Date()
                });
      
                this.io.to(conversationId).emit('new_message', message);
      
                const otherParticipants = conversation.participants.filter(p => p !== user._id.toString());
                const onlineParticipants = otherParticipants.filter(p => this.connectedUsers.has(p));
      
                if (onlineParticipants.length > 0) {
                  await Message.findByIdAndUpdate(message._id, {
                    isDelivered: true,
                    deliveredAt: new Date()
                  });
      
                  this.io.to(conversationId).emit('message_delivered', {
                    messageId: message._id,
                    deliveredAt: new Date()
                  });
                }
      
              } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
              }
            });
      
            socket.on('mark_read', async (data) => {
              try {
                const { messageId } = data;
                
                await Message.findByIdAndUpdate(messageId, {
                  isRead: true,
                  readAt: new Date()
                });
      
                const message = await Message.findById(messageId);
                if (message) {
                  this.io.to(message.conversationId).emit('message_read', {
                    messageId,
                    readAt: new Date(),
                    readBy: user._id.toString()
                  });
                }
              } catch (error) {
                console.error('Error marking message as read:', error);
              }
            });
      
            socket.on('typing_start', (data) => {
              const { conversationId } = data;
              socket.to(conversationId).emit('user_typing', {
                userId: user._id.toString(),
                displayName: user.displayName
              });
            });
      
            socket.on('typing_stop', (data) => {
              const { conversationId } = data;
              socket.to(conversationId).emit('user_stopped_typing', {
                userId: user._id.toString()
              });
            });
      
            socket.on('disconnect', async () => {
              console.log(`User ${user.displayName} disconnected`);
              
              this.connectedUsers.delete(user._id.toString());
      
              await User.findByIdAndUpdate(user._id, {
                isOnline: false,
                lastSeen: new Date()
              });
      
              conversations.forEach(conv => {
                socket.to(conv._id.toString()).emit('user_offline', {
                  userId: user._id.toString(),
                  lastSeen: new Date()
                });
              });
            });
          });
    }

    public getIO(): SocketIOServer {
        return this.io;
      }
}

