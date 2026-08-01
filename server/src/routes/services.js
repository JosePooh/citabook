import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req, res) => {
  const services = db
    .prepare('SELECT * FROM services WHERE active = 1 ORDER BY name')
    .all();
  res.json(services);
});

router.get('/all', requireAuth, (_req, res) => {
  const services = db.prepare('SELECT * FROM services ORDER BY name').all();
  res.json(services);
});

router.post('/', requireAuth, (req, res) => {
  const { name, duration, price } = req.body;
  if (!name || !duration) {
    return res.status(400).json({ error: 'Nombre y duración son requeridos' });
  }
  const result = db
    .prepare('INSERT INTO services (name, duration, price) VALUES (?, ?, ?)')
    .run(name, duration, price ?? 0);
  const service = db
    .prepare('SELECT * FROM services WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json(service);
});

router.put('/:id', requireAuth, (req, res) => {
  const { name, duration, price, active } = req.body;
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Servicio no encontrado' });

  db.prepare(
    'UPDATE services SET name = ?, duration = ?, price = ?, active = ? WHERE id = ?'
  ).run(
    name ?? existing.name,
    duration ?? existing.duration,
    price ?? existing.price,
    active ?? existing.active,
    req.params.id
  );

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  res.json(service);
});

router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Servicio no encontrado' });

  db.prepare('UPDATE services SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Servicio desactivado' });
});

export default router;
