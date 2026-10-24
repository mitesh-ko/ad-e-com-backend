import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '#middlewares/validate.middleware.js';
import { authRateLimiter } from '#middlewares/rate-limiter.middleware.js';
import { authenticate } from '#middlewares/auth.middleware.js';
import { asyncHandler } from '#shared/utils/async-handler.js';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from './auth.schema.js';


const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 */
router.post(
  '/register',
  authRateLimiter,
  validate({ body: RegisterSchema }),
  asyncHandler(authController.register)
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user & return tokens
 */
router.post(
  '/login',
  authRateLimiter,
  validate({ body: LoginSchema }),
  asyncHandler(authController.login)
);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh expired access token with valid refresh token
 */
router.post(
  '/refresh',
  validate({ body: RefreshTokenSchema }),
  asyncHandler(authController.refreshToken)
);

/**
 * @route GET /api/v1/auth/me
 * @desc Get currently authenticated user profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(authController.getMe)
);

export default router;
