import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedUserPayload extends JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: AuthenticatedUserPayload;
    }
  }
}
