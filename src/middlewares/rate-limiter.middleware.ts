import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config.js';
import { HttpStatus } from '../constants/http-status.js';

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
  message: {
    success: false,
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    message: 'Too many requests from this IP, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});

// Stricter rate limiter for sensitive endpoints like login & register
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
  message: {
    success: false,
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});
