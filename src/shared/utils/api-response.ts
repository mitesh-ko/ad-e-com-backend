import { Response } from 'express';
import { HttpStatus, HttpStatusCode } from '#constants/http-status.js';


export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    message = 'Success',
    data?: T,
    statusCode: HttpStatusCode = HttpStatus.OK,
    meta?: Record<string, unknown> | PaginationMeta
  ): Response {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  public static created<T>(
    res: Response,
    message = 'Resource created successfully',
    data?: T,
    meta?: Record<string, unknown>
  ): Response {
    return this.success(res, message, data, HttpStatus.CREATED, meta);
  }

  public static noContent(res: Response): Response {
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  public static error(
    res: Response,
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode = 'INTERNAL_ERROR',
    errors?: unknown,
    stack?: string
  ): Response {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errorCode,
      errors,
      stack,
      timestamp: new Date().toISOString(),
    });
  }
}
