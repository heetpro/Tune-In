import { config } from "@/config/config";
import type { AuthRequest } from "@/middleware/auth";
import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";


export const queueMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

        const token = req.cookies.token;
        if (!token) {
            throw new Error('Unauthorized, no token provided');
        }
        const decoded: any = jwt.verify(token, config.jwt.secret || '');

        if (!decoded || !decoded.user) {
            throw new Error('Unauthorized, invalid token');
        }

        req.user = decoded.user;

        next();

    } catch (error) {
        throw error;
    }
}