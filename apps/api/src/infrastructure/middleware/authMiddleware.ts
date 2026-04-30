import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/TokenService';

const tokenService = new TokenService();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;

  if (!authHeader && !queryToken) {
    res.status(401).json({ error: 'Token not provided' });
    return;
  }

  const token = authHeader ? authHeader.split(' ')[1] : queryToken;

  try {
    const payload = tokenService.verifyToken(token);
    (req as any).user = payload as { id: string; email: string; role: string };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = (req as any).user;
  if (user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
