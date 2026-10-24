import { AppError } from './app-error.js';
import { HttpStatus } from '../constants/http-status.js';

export { AppError };

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errorCode = 'BAD_REQUEST', details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, errorCode, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED', details?: unknown) {
    super(message, HttpStatus.UNAUTHORIZED, errorCode, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden: Access is denied', errorCode = 'FORBIDDEN', details?: unknown) {
    super(message, HttpStatus.FORBIDDEN, errorCode, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', errorCode = 'NOT_FOUND', details?: unknown) {
    super(message, HttpStatus.NOT_FOUND, errorCode, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', errorCode = 'CONFLICT', details?: unknown) {
    super(message, HttpStatus.CONFLICT, errorCode, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR', details, false);
  }
}
