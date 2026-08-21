import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/index.js';

export interface AuthUser {
  id: number;
  username: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function jwtSecret(): string {
  return process.env.JWT_SECRET ?? 'dev-only-secret-change-me-in-production';
}

export function signToken(user: AuthUser, expiresIn: jwt.SignOptions['expiresIn'] = '12h'): string {
  return jwt.sign({ username: user.username }, jwtSecret(), {
    subject: String(user.id),
    expiresIn,
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const payload = jwt.verify(header.slice('Bearer '.length), jwtSecret()) as jwt.JwtPayload;
    const user = getDb()
      .prepare('SELECT id, username FROM users WHERE id = ?')
      .get(Number(payload.sub)) as AuthUser | undefined;

    if (!user) {
      res.status(401).json({ error: 'Account no longer exists' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}
