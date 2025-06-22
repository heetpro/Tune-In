import { verifyToken } from "@/lib/jwt";
import { User } from "@/models/User";
import type { Request, Response, NextFunction } from "express";
import type { CustomSocket } from "../types/index";
import type { ExtendedError } from "socket.io/dist/namespace";

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {

    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id).select('-__v');
        if (!user) {
            res.status(401).json({ error: 'Invalid token. User not found.' });
            return;
        }

        if (user.isBanned) {
            res.status(403).json({ error: 'Account is banned.' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
}

// Socket.io middleware for authentication
export const middleware = async (socket: CustomSocket, next: (err?: ExtendedError) => void) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication token required'));
        }
        
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return next(new Error('Invalid authentication token'));
        }
        
        if (user.isBanned) {
            return next(new Error('Account is banned'));
        }
        
        socket.userInfo = {
            id: user._id.toString(),
            role: user.isAdmin ? 'admin' : 'user'
        };
        
        next();
    } catch (error: any) {
        next(new Error('Authentication failed: ' + error.message));
    }
};