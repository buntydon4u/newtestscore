import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, decodeToken } from '../utils/jwt.js';
import crypto from 'crypto';
import { isTokenBlacklisted } from '../redis/tokenBlacklist.js';
import { prisma } from '../config/database.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
  token?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Check Redis blacklist - DISABLED
    // const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    // const blacklisted = await isTokenBlacklisted(tokenHash);
    // if (blacklisted) {
    //   res.status(401).json({ error: 'Token has been revoked' });
    //   return;
    // }

    // Check DB user validity
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!dbUser || dbUser.status !== 'ACTIVE') {
      res.status(401).json({ error: 'User account not active' });
      return;
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (payload) {
        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        };
        req.token = token;
      }
    }

    next();
  } catch (error) {
    next();
  }
}

export function roleMiddleware(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
