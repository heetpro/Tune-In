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
import { socketService } from './lib/socket';

const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`
});

const app = express();
const server = createServer(app);

app.use(useCors(cors))
app.use(express.json())
app.use(cookieParser())
app.use(router)
app.use(errorHandler)

redisClient.connect().then(() => {
  const io = new Server(server, {
    cors: cors,
    adapter: createAdapter(redisClient),
  });

  socketService.setIO(io);

  io.use(async (socket: CustomSocket, next) => {
    try {
      socket.compress(true);
      await middleware(socket, next);
    } catch (error: any) {
      next(new Error(error.message));
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    const userId = socket.handshake.query.userId as string;
    if (userId) {
      socketService.addUser(userId, socket.id);
    }

    socketService.emitToAll('getOnlineUsers', socketService.getOnlineUsers());

    socket.on('disconnect', () => {
      console.log('a user disconnected', socket.id);
      if (userId) {
        socketService.removeUser(userId);
        socketService.emitToAll('getOnlineUsers', socketService.getOnlineUsers());
      }
    });
  });
});

runServer(app);