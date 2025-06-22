import type { Response } from "express";
import jwt from "jsonwebtoken";

export const generateToken = (payload: object, res: Response): string => {
    // @ts-ignore - Ignore type checking for jwt.sign to resolve the issue
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
  };
  
  export const generateRefreshToken = (payload: object): string => {
    // @ts-ignore - Ignore type checking for jwt.sign to resolve the issue
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
    });
  };
  
  export const verifyToken = (token: string): any => {
    return jwt.verify(token, process.env.JWT_SECRET!);
  };
  
  export const verifyRefreshToken = (token: string): any => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  };