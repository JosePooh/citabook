import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Service } from '../types';

export default function Booking() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    service_id: 0,
    client_name: '',
    client_email: '',
    client_phone: '',
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    api.getServices().then(setServices).catch(console.error);
  }, []);

  useEffect(() => {
    if (form.date) {
      api.getAvailableSlots(form.date)
        .then((data) => setSlots(data.available))
        .catch(console.error);
    }
  }, [form.date]);

  const selectedService = services.find((s) => s.id === form.service_id);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await api.createAppointment(form);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reservar');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="card success-msg">
        <div className="icon">✅</div>
        <h2>¡Cita reservada!</h2>
        <p>
          Tu cita de <strong>{selectedService?.name}</strong> para el{' '}
          <strong>{form.date}</strong> a las <strong>{form.time}</strong> ha sido registrada.
        </p>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Reservar cita</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Completa los pasos para agendar tu cita
      </p>

      <div className="steps">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
          1. Servicio
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
          2. Fecha y hora
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          3. Tus datos
        </div>
      </div>

      <div className="card">
        {error && <div className="error-msg">{error}</div>}

        {step === 1 && (
          <>
            <h2 style={{ marginBottom: '1rem' }}>Elige un servicio</h2>
            <div className="card-grid" style={{ marginTop: 0 }}>
              {services.map((s) => (
                <button
                  key={s.id}
                  className="service-card"
                  style={{
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderColor: form.service_id === s.id ? 'var(--primary)' : undefined,
                    background: form.service_id === s.id ? 'var(--primary-light)' : undefined,
                  }}
                  onClick={() => setForm({ ...form, service_id: s.id })}
                >
                  <h3>{s.name}</h3>
                  <div className="meta">
                    <span>⏱ {s.duration} min</span>
                  </div>
                  <div className="price">${s.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                className="btn btn-primary"
                disabled={!form.service_id}
                onClick={() => setStep(2)}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ marginBottom: '1rem' }}>Fecha y hora</h2>
            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value, time: '' })}
              />
            </div>
            {form.date && (
              <div className="form-group">
                <label>Horario disponible</label>
                {slots.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No hay horarios disponibles este día</p>
                ) : (
                  <div className="time-slots">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        className={`time-slot ${form.time === slot ? 'selected' : ''}`}
                        onClick={() => setForm({ ...form, time: slot })}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                ← Atrás
              </button>
              <button
                className="btn btn-primary"
                disabled={!form.date || !form.time}
                onClick={() => setStep(3)}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ marginBottom: '1rem' }}>Tus datos</h2>
            {selectedService && (
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {selectedService.name} — {form.date} a las {form.time} — ${selectedService.price.toFixed(2)}
              </p>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  value={form.client_phone}
                  onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                  placeholder="0999 999 999"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.client_email}
                onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                placeholder="tu@email.com"
              />
            </div>
            <div className="form-group">
              <label>Notas (opcional)</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Alguna indicación especial..."
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                ← Atrás
              </button>
              <button
                className="btn btn-primary"
                disabled={!form.client_name || !form.client_email || !form.client_phone || loading}
                onClick={handleSubmit}
              >
                {loading ? 'Reservando...' : 'Confirmar cita ✓'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
