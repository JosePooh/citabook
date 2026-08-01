import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Service } from '../types';

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <h1>Reserva tu cita en segundos</h1>
        <p>
          Sistema de citas online para barberías, salones y negocios locales.
          Elige tu servicio, fecha y hora. ¡Así de fácil!
        </p>
        <Link to="/reservar" className="btn btn-primary">
          Reservar ahora →
        </Link>
      </section>

      <section>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Nuestros servicios</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Selecciona el servicio que necesitas
        </p>

        {loading ? (
          <div className="loading">Cargando servicios...</div>
        ) : (
          <div className="card-grid">
            {services.map((s) => (
              <div key={s.id} className="service-card">
                <h3>{s.name}</h3>
                <div className="meta">
                  <span>⏱ {s.duration} min</span>
                </div>
                <div className="price">${s.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">📅</div>
          <h3>Reserva online</h3>
          <p>Elige fecha y hora disponible desde tu celular o computadora</p>
        </div>
        <div className="feature">
          <div className="feature-icon">⚡</div>
          <h3>Confirmación instantánea</h3>
          <p>Recibe confirmación al momento de reservar tu cita</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔔</div>
          <h3>Panel de administración</h3>
          <p>El negocio gestiona todas las citas desde un panel central</p>
        </div>
      </section>
    </div>
  );
}
