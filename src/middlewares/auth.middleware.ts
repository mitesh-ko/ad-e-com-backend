import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../shared/services/token.service.js';
import { UnauthorizedError } from '../errors/index.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token is required', 'MISSING_BEARER_TOKEN');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new UnauthorizedError('Malformed authorization header', 'INVALID_BEARER_TOKEN');
  }

  const payload = TokenService.verifyAccessToken(token);
  req.user = payload;
  next();
};
