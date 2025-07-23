import express from 'express';
import http from 'http';
import router from "./router/router";
import { runServer } from './lib/db';
import { createClient } from "redis";
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { config } from './config/config';
import useCors from "cors";
import { cors } from './lib/utils';
import { errorHandler } from './handlers/errorHandler';
import { createAdapter } from '@socket.io/redis-streams-adapter';
import { middleware } from './handlers/middleware';
import type { CustomSocket } from './types';
import { socketService } from './lib/socket';
import { User } from './models/User';
import mongoose from 'mongoose';
import Match from './models/Match';

const app = express();
const server = http.createServer(app);

app.use(useCors(cors))
app.use(express.json())
app.use(cookieParser())
app.use(router)
app.use(errorHandler)

// Redis client setup
try {
  // const redisClient = createClient({
  //   url: `redis://${config.redis.host}:${config.redis.port}`
  // });
  
  // await redisClient.connect();
  console.log('Redis client connected');
  
  const io = new Server(server, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
    // adapter: createAdapter(redisClient),
    // Allow both websocket and polling for better compatibility
    pingTimeout: 5000,  // Disconnect if no pong received in 5s
    pingInterval: 10000, // Send ping every 10s to keep connection alive
    serveClient: true, // Ensure client script is served
  });

  socketService.setIO(io);
  console.log('socket client connected');

  console.log('Setting up socket middleware');

  // Enhanced authentication middleware
  io.use(async (socket: CustomSocket, next) => {
    console.log('Socket attempting connection:', socket.id);
    console.log('Socket query params:', socket.handshake.query);
    console.log('Socket auth:', socket.handshake.auth);
    
    try {
      socket.compress(true);
      console.log('Before middleware call');
      await middleware(socket, next);
      console.log('After middleware call - authentication successful');
    } catch (error: any) {
      console.error('Socket authentication failed - DETAILS:', error);
      next(new Error('Authentication error'));
    }
  });

  // Advanced connection management
  io.on('connection', (socket: CustomSocket) => {
    console.log('User connected:', socket.id);

    const userId = socket.handshake.query.userId as string;
    if (!userId) {
      console.log('No userId provided, disconnecting socket', socket.id);
      socket.disconnect();
      return;
    }

    console.log(`User connected with ID: ${userId}, type: ${typeof userId}`);

    // Join user-specific room
    socket.join(userId);
    socketService.addUser(userId, socket.id);

    // Notify all clients of updated online users
    io.emit('user_status_changed', { userId, status: 'online' });
    
    // Also send the full list for initial state
    socketService.emitToAll('getOnlineUsers', socketService.getOnlineUsers());

    // Handle getting friends
    socket.on('getFriends', async (callback) => {
      try {
        console.log(`getFriends called with userId: ${userId}, type: ${typeof userId}`);
    

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.error(`Invalid userId format: ${userId}`);
          return callback?.({ 
            status: 'error', 
            message: 'Invalid user ID format' 
          });
        }

        const user = await User.findById(userId);
        
        if (!user) {
          console.error(`User not found with ID: ${userId}`);
          return callback?.({ 
            status: 'error', 
            message: 'User not found' 
          });
        }

        console.log(`User found: ${user._id}, checking friends...`);
        console.log(`Friends structure:`, JSON.stringify(user.friends));

        // Get friend IDs safely
        const friendIds = (user.friends && user.friends.id && 
          Array.isArray(user.friends.id)) ? 
          user.friends.id.filter(id => mongoose.Types.ObjectId.isValid(id)) : 
          [];

        console.log(`Valid friend IDs: ${friendIds.length}`);

        // Get all friends of this user
        const friends = await User.find({
          _id: { $in: friendIds }
        }).select('_id displayName firstName lastName profilePicture lastSeen');
        
        console.log(`Found ${friends.length} friends`);
        
        callback?.({ 
          status: 'ok', 
          friends: friends 
        });
      } catch (error) {
        console.error('Error getting friends:', error);
        callback?.({ 
          status: 'error', 
          message: 'Failed to get friends' 
        });
      }
    });

    // Get users to chat with
    socket.on('getUsersToChat', async (callback) => {
      try {
        console.log(`getUsersToChat called with userId: ${userId}, type: ${typeof userId}`);
        
        

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.error(`Invalid userId format: ${userId}`);
          return callback?.({ 
            status: 'error', 
            message: 'Invalid user ID format' 
          });
        }
        
        const currentUser = await User.findById(userId);
        if (!currentUser) {
          return callback?.({ 
            status: 'error', 
            message: 'User not found' 
          });
        }
        
        // Safely get friend IDs
        const friendIds = (currentUser.friends && 
                          currentUser.friends.id && 
                          Array.isArray(currentUser.friends.id)) ? 
                          currentUser.friends.id.filter(id => mongoose.Types.ObjectId.isValid(id)) : 
                          [];
        
        const acceptedMatches = await Match.find({
            $or: [
                { user1Id: userId, status: 'accepted' },
                { user2Id: userId, status: 'accepted' }
            ]
        });
        
        const matchedUserIds = acceptedMatches.map(match => 
            match.user1Id === userId ? match.user2Id : match.user1Id
        );
        
        // Filter out invalid IDs
        const validMatchedUserIds = matchedUserIds.filter(id => 
            typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)
        );
        
        const allowedUserIds = [...new Set([...validMatchedUserIds, ...friendIds])];
        
        if (allowedUserIds.length === 0) {
            return callback?.({
              status: 'ok',
              users: []
            });
        }
        
        const users = await User.find({
            _id: { $in: allowedUserIds }
        }).select('_id username displayName profilePicture lastSeen');
        
        callback?.({
          status: 'ok',
          users: users
        });
      } catch (error) {
        console.error('Error getting users to chat:', error);
        callback?.({
          status: 'error',
          message: 'Failed to get users to chat'
        });
      }
    });

    // Handle message sending with acknowledgment
    socket.on('send_message', async (data, callback) => {
      try {
        const { receiverId, text } = data;
        
        if (!receiverId || !text || typeof text !== 'string') {
          return callback?.({ status: 'error', message: 'Invalid message data' });
        }

        // Here you would normally save the message to database
        const messageData = {
          senderId: userId,
          receiverId,
          text,
          isDelivered: socketService.getUserSocket(receiverId) ? true : false,
          createdAt: new Date()
        };

        // Emit to recipient if online
        io.to(receiverId).emit('new_message', messageData);
        
        // Emit to sender for confirmation
        socket.emit('new_message', messageData);

        // Acknowledge successful delivery
        callback?.({ status: 'ok', message: messageData });
      } catch (error: any) {
        console.error('Error sending message:', error);
        callback?.({ status: 'error', message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { conversationId, receiverId } = data;
      
      if (receiverId) {
        io.to(receiverId).emit('user_typing', {
          userId,
          conversationId,
          timestamp: Date.now()
        });
      }
    });

    // Handle read receipts
    socket.on('read_message', (data) => {
      try {
        const { messageId, senderId } = data;
        
        if (senderId) {
          io.to(senderId).emit('message_read', { messageId });
        }
      } catch (error: any) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (userId) {
        socketService.removeUser(userId);
        io.emit('user_status_changed', { userId, status: 'offline' });
        socketService.emitToAll('getOnlineUsers', socketService.getOnlineUsers());
      }
    });
  });
} catch (error) {
  console.error('Redis connection error:', error);
}

// FIXED: Pass the server instance, not the app
runServer(server);