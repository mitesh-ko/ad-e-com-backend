import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '#config/env.config.js';
import { AuthenticatedUserPayload } from '#types/express.js';
import { UnauthorizedError } from '#errors/index.js';


export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class TokenService {
  public static generateTokens(payload: Omit<AuthenticatedUserPayload, 'iat' | 'exp'>): TokenPair {
    const accessOptions: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as unknown as number,
    };
    const refreshOptions: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as unknown as number,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, accessOptions);
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshOptions);

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  public static verifyAccessToken(token: string): AuthenticatedUserPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthenticatedUserPayload;
      return decoded;
    } catch {
      throw new UnauthorizedError('Invalid or expired access token', 'TOKEN_EXPIRED');
    }
  }

  public static verifyRefreshToken(token: string): AuthenticatedUserPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthenticatedUserPayload;
      return decoded;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token', 'REFRESH_TOKEN_EXPIRED');
    }
  }
}
