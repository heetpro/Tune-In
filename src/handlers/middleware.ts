import { Socket } from "socket.io";

export const middleware = async (socket: Socket, next: (err?: any) => void) => {
  try {
    socket.compress(true);
    next();
  } catch (error: any) {
    next(new Error(error.message));
  }
};