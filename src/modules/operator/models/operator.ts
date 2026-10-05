import { MaterialIcons } from '@expo/vector-icons';
import { PillTone } from '../../../shared/components/ui/Pill';

// estados del servicio asignado (mismos valores que la web: reservation.model.ts)
export type ReservationStatus = 'pendiente' | 'en_progreso' | 'finalizado';

// servicio asignado al operario: lo usan inicio, agenda y servicios asignados
export interface OperatorReservation {
  id: number;
  code: string;
  date: string; // aaaa-mm-dd
  time: string; // HH:mm
  service: string; // nombres de los servicios, ya escritos por el backend
  client: string;
  phone: string;
  vehicle: string; // tipo: CAR, MOTO... (vacío si el backend no lo manda: ícono de carro)
  vehicleName: string; // "Mazda 3"
  plate: string;
  durationMin: number;
  paymentMethod: string; // CARD | PSE | NEQUI | CASH; vacío mientras payment no lo asocie
  // total de la reserva (booking-service)
  total?: number;
  status: ReservationStatus;
  // calificación del cliente cuando ya terminó (operations-service)
  rating?: number | null;
  comment?: string | null;
}

export function statusLabel(status: ReservationStatus): string {
  return `SCHEDULE.STATUS.${status.toUpperCase()}`;
}

export function statusTone(status: ReservationStatus): PillTone {
  if (status === 'finalizado') return 'success';
  if (status === 'en_progreso') return 'primary';
  return 'warning';
}

export function statusIcon(status: ReservationStatus): keyof typeof MaterialIcons.glyphMap {
  if (status === 'finalizado') return 'check-circle';
  if (status === 'en_progreso') return 'play-circle-outline';
  return 'schedule';
}

// historial de servicios del operario (mismo modelo que la web: service-history.model.ts)
export type HistoryStatus = 'finalizado' | 'cancelado' | 'reasignado';

export interface ServiceHistoryItem {
  id: number;
  code: string;
  date: string; // aaaa-mm-dd
  time: string;
  service: string;
  vehicle: string;
  plate: string;
  client: string;
  paymentMethod: string;
  amount: number;
  rating: number | null;
  comment: string | null;
  status: HistoryStatus;
  reason: string | null;
}

export function historyTone(status: HistoryStatus): PillTone {
  if (status === 'finalizado') return 'success';
  if (status === 'cancelado') return 'error';
  return 'warning';
}

// calificación recibida de un cliente
export interface RatingItem {
  id: number;
  client: string;
  service: string; // nombres de los servicios
  date: string; // aaaa-mm-dd
  rating: number;
  comment: string;
  duration: string;
  serviceId: string;
}
