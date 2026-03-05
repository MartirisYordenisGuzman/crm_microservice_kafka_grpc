import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-min-32-chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },

  services: {
    user: {
      host: process.env.USER_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.USER_SERVICE_PORT || '50051'),
      httpPort: parseInt(process.env.USER_SERVICE_HTTP_PORT || '5000'),
    },
    product: {
      host: process.env.PRODUCT_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.PRODUCT_SERVICE_PORT || '50052'),
      httpPort: parseInt(process.env.PRODUCT_SERVICE_HTTP_PORT || '5001'),
    },
    order: {
      host: process.env.ORDER_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.ORDER_SERVICE_PORT || '50053'),
      httpPort: parseInt(process.env.ORDER_SERVICE_HTTP_PORT || '5002'),
    },
    notification: {
      host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '50054'),
      httpPort: parseInt(process.env.NOTIFICATION_SERVICE_HTTP_PORT || '5003'),
    },
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
};