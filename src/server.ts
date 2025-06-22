import express from 'express';
import { createServer } from 'http';
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

const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`
});

const app = express();
const server = createServer(app);

app.use(useCors(cors))

// app.use(rateLimiter)
app.use(express.json())
app.use(cookieParser())
app.use(router)
app.use(errorHandler)


redisClient.connect().then(() => {
  const io = new Server(server, {
    cors: cors,
    adapter: createAdapter(redisClient),
  });
  io.use(async (socket: CustomSocket, next) => {
    try {
      socket.compress(true);
      await middleware(socket, next);
    } catch (error: any) {
      next(new Error(error.message));
    }
  });

    export const getReceiverSocketId = (userId: string) => {
    return userSocketMap.get(userId);
  }

  // to track online freaks.
  const userSocketMap = new Map<string, string>();

  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    const userId = socket.handshake.query.userId as string;
    if (userId) {
      userSocketMap.set(userId, socket.id);
    }

    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));

    socket.on('disconnect', () => {
      console.log('a user disconnected', socket.id);
      userSocketMap.delete(userId);
      io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
    });
  });

  // setSocketListeners(io);
});

runServer(app);