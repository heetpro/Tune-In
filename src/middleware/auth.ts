import { verifyToken } from "@/lib/jwt";
import { User } from "@/models/User";
import type { Request, Response, NextFunction } from "express";

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