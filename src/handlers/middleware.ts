import { Socket } from "socket.io";
import mongoose from "mongoose";

export const middleware = async (socket: Socket, next: (err?: any) => void) => {
  try {
    console.log('middleware');
    
    const userId = socket.handshake.query.userId;
    
    console.log(`Middleware processing userId: ${userId}, type: ${typeof userId}`);
    
    const userIdStr = String(userId);
    if (userIdStr.includes('function String()') || 
        userIdStr === 'String' ||
        userIdStr === '[object Function]') {
      console.error('CRITICAL ERROR: String constructor detected in middleware');
      return next(new Error('Invalid user ID: String constructor received'));
    }
    
    // If userId is provided, validate it's a proper ObjectId
    if (userId && typeof userId === 'string') {
      // Try to validate the ObjectId
      const isValid = mongoose.Types.ObjectId.isValid(userId);
      if (!isValid) {
        console.error(`Invalid ObjectId format for userId: ${userId}`);
        return next(new Error('Invalid user ID format'));
      }
      
      console.log(`Valid userId confirmed: ${userId}`);
    }
    
    socket.compress(true);
    next();
  } catch (error: any) {
    console.error('Middleware error:', error);
    next(new Error(error.message));
  }
};