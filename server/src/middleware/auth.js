import { randomUUID } from 'crypto';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

const sessions = new Map();

export function createSession() {
  const token = randomUUID();
  sessions.set(token, { createdAt: Date.now() });
  return token;
}

export function isValidSession(token) {
  if (!token || !sessions.has(token)) return false;
  const session = sessions.get(token);
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > maxAge) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token) {
  sessions.delete(token);
}

export function checkCredentials(username, password) {
  return username === ADMIN_USER && password === ADMIN_PASS;
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!isValidSession(token)) {
    return res.status(401).json({ error: 'No autorizado. Inicia sesión.' });
  }

  next();
}
