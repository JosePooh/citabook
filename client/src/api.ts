import type { Appointment, BookingForm, Service } from './types';
import { getToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || '';
const BASE = `${API_BASE}/api`;

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: { ...authHeaders(), ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; username: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', { method: 'POST' }),

  checkAuth: () =>
    request<{ authenticated: boolean }>('/auth/me'),

  getServices: () => request<Service[]>('/services'),
  getAllServices: () => request<Service[]>('/services/all'),
  getAvailableSlots: (date: string) =>
    request<{ date: string; available: string[] }>(`/appointments/slots?date=${date}`),
  getAppointments: (params?: { date?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<Appointment[]>(`/appointments${qs ? `?${qs}` : ''}`);
  },
  createAppointment: (data: BookingForm) =>
    request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAppointment: (id: number, data: Partial<Appointment>) =>
    request<Appointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  cancelAppointment: (id: number) =>
    request<{ message: string }>(`/appointments/${id}`, { method: 'DELETE' }),
};
