import { Router } from 'express';
import {
  checkCredentials,
  createSession,
  destroySession,
  isValidSession,
} from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  if (!checkCredentials(username, password)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = createSession();
  res.json({ token, username });
});

router.get('/me', (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!isValidSession(token)) {
    return res.status(401).json({ error: 'Sesión expirada' });
  }

  res.json({ authenticated: true });
});

router.post('/logout', (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) destroySession(token);
  res.json({ message: 'Sesión cerrada' });
});

export default router;
