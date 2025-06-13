import { config } from '@/config/config';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  
});

// export const slowDownMiddleware = slowDown({
//     windowMs: 15 * 60 * 1000,
//     delayAfter: parseInt(process.env.RATE_LIMIT_SLOW_DOWN || '50'),
//     delayMs: 500,
// })