import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
}

router.post('/register', (req, res) => {
  const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
  const name = typeof username === 'string' ? username.trim() : '';

  if (name.length < 3) {
    res.status(400).json({ error: 'Username must be at least 3 characters' });
    return;
  }
  if (!/^[A-Za-z0-9_-]+$/.test(name)) {
    res.status(400).json({ error: 'Username may only contain letters, numbers, dashes, and underscores' });
    return;
  }
  if (typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(name);
  if (existing) {
    res.status(409).json({ error: 'That username is already taken' });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(name, hash);
  const user = { id: Number(info.lastInsertRowid), username: name };
  const token = signToken(user, '30d');

  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { username, password, remember } = (req.body ?? {}) as {
    username?: string;
    password?: string;
    remember?: boolean;
  };

  const db = getDb();
  const user = db
    .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
    .get(typeof username === 'string' ? username.trim() : '') as UserRow | undefined;

  if (!user || typeof password !== 'string' || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = signToken({ id: user.id, username: user.username }, remember ? '30d' : '12h');
  res.json({ token, user: { id: user.id, username: user.username } });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', (_req, res) => {
  // Stateless JWT: the client simply discards the token.
  res.json({ ok: true });
});

export default router;
