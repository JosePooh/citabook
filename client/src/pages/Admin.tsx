import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Appointment } from '../types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

export default function Admin() {
  const { logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    setLoading(true);
    api
      .getAppointments({
        date: filterDate || undefined,
        status: filterStatus || undefined,
      })
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filterDate, filterStatus]);

  const updateStatus = async (id: number, status: string) => {
    await api.updateAppointment(id, { status } as Partial<Appointment>);
    load();
  };

  const cancel = async (id: number) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    await api.cancelAppointment(id);
    load();
  };

  const today = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter((a) => a.date === today && a.status !== 'cancelled').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;

  return (
    <div>
      <div className="admin-header">
        <h1>Panel de administración</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={load}>
            🔄 Actualizar
          </button>
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="number">{todayCount}</div>
          <div className="label">Citas hoy</div>
        </div>
        <div className="stat-card">
          <div className="number">{pendingCount}</div>
          <div className="label">Pendientes</div>
        </div>
        <div className="stat-card">
          <div className="number">{confirmedCount}</div>
          <div className="label">Confirmadas</div>
        </div>
        <div className="stat-card">
          <div className="number">{appointments.length}</div>
          <div className="label">Total filtrado</div>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="Filtrar por fecha"
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="cancelled">Cancelada</option>
            <option value="completed">Completada</option>
          </select>
          {(filterDate || filterStatus) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setFilterDate(''); setFilterStatus(''); }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Cargando citas...</div>
        ) : appointments.length === 0 ? (
          <div className="loading">No hay citas para mostrar</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div>{a.client_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {a.client_phone}
                      </div>
                    </td>
                    <td>{a.service_name}</td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>
                      <span className={`status-badge status-${a.status}`}>
                        {STATUS_LABELS[a.status] || a.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        {a.status === 'pending' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => updateStatus(a.id, 'confirmed')}
                          >
                            ✓
                          </button>
                        )}
                        {a.status === 'confirmed' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => updateStatus(a.id, 'completed')}
                          >
                            ✓✓
                          </button>
                        )}
                        {a.status !== 'cancelled' && a.status !== 'completed' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => cancel(a.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
