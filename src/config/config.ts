import dotenv from "dotenv"
dotenv.config()

export const config = {
    port: process.env.PORT || 3000,
    db: {
        url: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    },
    api: {
        baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
    },
    rateLimit: {
        max: process.env.RATE_LIMIT_MAX || 100, 
        windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    },
    slowDown: {
        windowMs: process.env.SLOW_DOWN_WINDOW_MS || 15 * 60 * 1000,
        delayAfter: process.env.SLOW_DOWN_DELAY_AFTER || 100,
        delayMs: process.env.SLOW_DOWN_DELAY_MS || 1000,
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization',
    },
    logger: {
        level: process.env.LOG_LEVEL || 'info',
    },
    cache: {
        ttl: process.env.CACHE_TTL || 60 * 60 * 1000,
    },

}