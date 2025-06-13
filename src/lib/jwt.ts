import jwt from "jsonwebtoken";

export const generateToken = (payload: object): string => {
    // @ts-ignore - Ignore type checking for jwt.sign to resolve the issue
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
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