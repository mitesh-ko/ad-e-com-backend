import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { ApiResponse } from '../shared/utils/api-response.js';
import { HttpStatus } from '../constants/http-status.js';
import { env } from '../config/env.config.js';
import { logger } from '../config/logger.config.js';

interface MongooseError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string; path: string }>;
}

export const errorHandler = (
  err: Error | AppError | MongooseError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // If response was already sent, delegate to Express default handler
  if (res.headersSent) {
    return;
  }

  // 1. Operational AppErrors
  if (err instanceof AppError) {
    ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.errorCode,
      err.details,
      env.NODE_ENV === 'development' ? err.stack : undefined
    );
    return;
  }

  // 2. Mongoose Duplicate Key Error (Code 11000)
  const mongoErr = err as MongooseError;
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    const keys = Object.keys(mongoErr.keyValue).join(', ');
    ApiResponse.error(
      res,
      `Duplicate value entered for field(s): ${keys}. Resource already exists.`,
      HttpStatus.CONFLICT,
      'DUPLICATE_RESOURCE',
      mongoErr.keyValue
    );
    return;
  }

  // 3. Mongoose Validation Errors
  if (mongoErr.name === 'ValidationError' && mongoErr.errors) {
    const errors = Object.values(mongoErr.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    ApiResponse.error(res, 'Database validation error', HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', errors);
    return;
  }

  // 4. Mongoose Invalid ObjectId CastError
  if (mongoErr.name === 'CastError') {
    ApiResponse.error(res, 'Invalid identifier format', HttpStatus.BAD_REQUEST, 'INVALID_ID_FORMAT');
    return;
  }

  // 5. Malformed JSON Body
  if (err instanceof SyntaxError && 'body' in err) {
    ApiResponse.error(res, 'Invalid JSON body in request', HttpStatus.BAD_REQUEST, 'MALFORMED_JSON');
    return;
  }

  // 6. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    ApiResponse.error(res, 'Invalid token provided', HttpStatus.UNAUTHORIZED, 'INVALID_TOKEN');
    return;
  }
  if (err.name === 'TokenExpiredError') {
    ApiResponse.error(res, 'Token has expired', HttpStatus.UNAUTHORIZED, 'TOKEN_EXPIRED');
    return;
  }

  // 7. Unhandled Server Exceptions (500)
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
      reqId: req.id,
      url: req.url,
      method: req.method,
    },
    'Unhandled Server Exception'
  );

  ApiResponse.error(
    res,
    env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message,
    HttpStatus.INTERNAL_SERVER_ERROR,
    'INTERNAL_SERVER_ERROR',
    undefined,
    env.NODE_ENV === 'development' ? err.stack : undefined
  );
};
