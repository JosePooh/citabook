export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  active: number;
}

export interface Appointment {
  id: number;
  service_id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
  service_name?: string;
  duration?: number;
  price?: number;
}

export interface BookingForm {
  service_id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  date: string;
  time: string;
  notes: string;
}
