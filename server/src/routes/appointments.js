import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];

router.get('/slots', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Fecha requerida' });

  const booked = db
    .prepare(
      "SELECT time FROM appointments WHERE date = ? AND status != 'cancelled'"
    )
    .all(date)
    .map((r) => r.time);

  const available = TIME_SLOTS.filter((slot) => !booked.includes(slot));
  res.json({ date, available, all: TIME_SLOTS });
});

router.post('/clear-all', requireAuth, (_req, res) => {
  db.prepare('DELETE FROM appointments').run();
  res.json({ message: 'Todas las citas eliminadas' });
});

router.get('/', requireAuth, (req, res) => {
  const { date, status } = req.query;
  let query = `
    SELECT a.*, s.name as service_name, s.duration, s.price
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (date) {
    query += ' AND a.date = ?';
    params.push(date);
  }
  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }

  query += ' ORDER BY a.date DESC, a.time ASC';
  const appointments = db.prepare(query).all(...params);
  res.json(appointments);
});

router.get('/:id', requireAuth, (req, res) => {
  const appointment = db
    .prepare(
      `SELECT a.*, s.name as service_name, s.duration, s.price
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`
    )
    .get(req.params.id);

  if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });
  res.json(appointment);
});

router.post('/', (req, res) => {
  const { service_id, client_name, client_email, client_phone, date, time, notes } =
    req.body;

  if (!service_id || !client_name || !client_email || !client_phone || !date || !time) {
    return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
  }

  const service = db.prepare('SELECT * FROM services WHERE id = ? AND active = 1').get(service_id);
  if (!service) return res.status(400).json({ error: 'Servicio no válido' });

  const conflict = db
    .prepare(
      "SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled'"
    )
    .get(date, time);

  if (conflict) {
    return res.status(409).json({ error: 'Ese horario ya está ocupado' });
  }

  const result = db
    .prepare(
      `INSERT INTO appointments (service_id, client_name, client_email, client_phone, date, time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(service_id, client_name, client_email, client_phone, date, time, notes ?? null);

  const appointment = db
    .prepare(
      `SELECT a.*, s.name as service_name, s.duration, s.price
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json(appointment);
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Cita no encontrada' });

  const { status, notes, date, time } = req.body;

  if (date && time && (date !== existing.date || time !== existing.time)) {
    const conflict = db
      .prepare(
        "SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled' AND id != ?"
      )
      .get(date, time, req.params.id);
    if (conflict) {
      return res.status(409).json({ error: 'Ese horario ya está ocupado' });
    }
  }

  db.prepare(
    'UPDATE appointments SET status = ?, notes = ?, date = ?, time = ? WHERE id = ?'
  ).run(
    status ?? existing.status,
    notes ?? existing.notes,
    date ?? existing.date,
    time ?? existing.time,
    req.params.id
  );

  const appointment = db
    .prepare(
      `SELECT a.*, s.name as service_name, s.duration, s.price
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`
    )
    .get(req.params.id);

  res.json(appointment);
});

router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Cita no encontrada' });

  db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Cita cancelada' });
});

export default router;
