import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

import authRoutes from './router/auth';
import friendRoutes from './router/friend';
import { rateLimiter } from './middleware/rateLimiter';
import connectDB from './lib/database';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  }
});

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(rateLimiter);
// app.use(slowDownMiddleware);

app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);
app.use('/api/friends', friendRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize WebSocket handler

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || '3002';

const startServer = async () => {
  try {
    await connectDB();
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`HTTP Server running on port ${PORT}`);
      console.log(`WebSocket Server running on port ${WEBSOCKET_PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Spotify redirect URI: ${process.env.SPOTIFY_REDIRECT_URI}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});