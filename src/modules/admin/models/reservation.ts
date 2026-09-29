// Modelos y tipos del módulo de reservas

export type ReservationStatus =
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

// Orden en el que aparecen los estados en los selectores
export const RESERVATION_STATUSES: ReservationStatus[] = [
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'rescheduled',
];

export interface Reservation {
  id: string;
  code: string; // Ejemplo: #RES-8910
  customerName: string;
  phone: string;
  email: string;
  vehicle: string;
  plate: string;
  serviceId: string;
  date: string; // Formato ISO: YYYY-MM-DD
  time: string; // Formato HH:mm
  duration: number; // En minutos
  bayId: string; // '' = sin bahía
  operatorId: string; // '' = sin operario
  status: ReservationStatus;
  notes: string;
}

// Valores que llenan el formulario (el id y el código los genera el sistema)
export type ReservationFormValues = Omit<Reservation, 'id' | 'code'>;

export interface ServiceOption {
  id: string;
  name: string;
  duration: number; // Duración por defecto en minutos
}

export interface BayOption {
  id: string;
  name: string;
}

export interface Operator {
  id: string;
  name: string;
}

// Filtros de la lista de reservas
export interface ReservationFilters {
  search: string;
  date: string; // Texto dd/mm/aaaa (vacío = todas las fechas)
  status: '' | ReservationStatus; // '' = todos
  operatorId: string; // '' = todos, 'unassigned' = sin asignar
}

// Números de las tarjetas de estadísticas
export interface ReservationStatsData {
  total: number;
  active: number;
  unassigned: number;
  cancelled: number;
}
