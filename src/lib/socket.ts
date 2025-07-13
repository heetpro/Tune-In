import { Server } from 'socket.io';
import type { CustomSocket } from '../types';

class SocketService {
  private io: Server | null = null;
  private userSocketMap = new Map<string, string>();

  public setIO(io: Server) {
    this.io = io;
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO not initialized');
    }
    return this.io;
  }

  public getReceiverSocketId(userId: string): string | undefined {
    return this.userSocketMap.get(userId);
  }

  public getUserSocket(userId: string): string | undefined {
    return this.userSocketMap.get(userId);
  }

  public addUser(userId: string, socketId: string) {
    this.userSocketMap.set(userId, socketId);
  }

  public removeUser(userId: string) {
    this.userSocketMap.delete(userId);
  }

  public getOnlineUsers(): string[] {
    return Array.from(this.userSocketMap.keys());
  }

  public emitToUser(userId: string, event: string, data: any) {
    const socketId = this.getReceiverSocketId(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public emitToAll(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export const socketService = new SocketService();