import { pinoHttp } from 'pino-http';
import { logger } from '../config/logger.config.js';
import { IncomingMessage, ServerResponse } from 'http';
import { Request } from 'express';

export const requestLoggerMiddleware = pinoHttp({
  logger,
  genReqId: (req: IncomingMessage) => {
    const expressReq = req as unknown as Request;
    return expressReq.id || (req.headers['x-request-id'] as string) || 'unknown';
  },
  customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req: IncomingMessage, res: ServerResponse) =>
    `${req.method} ${req.url} completed with ${res.statusCode}`,
  customErrorMessage: (req: IncomingMessage, res: ServerResponse, err: Error) =>
    `${req.method} ${req.url} failed with ${res.statusCode}: ${err.message}`,
  autoLogging: {
    ignore: (req: IncomingMessage) => {
      // Don't flood logs with health check polls
      return req.url?.includes('/healthz') || req.url?.includes('/readyz') || req.url?.includes('/livez') || false;
    },
  },
});
