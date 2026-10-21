import { OPERATIONS_API_URL } from '../../api/config';
import { request } from '../../api/httpClient';

// operations-service (mismos endpoints que la web: operations-api.ts). Las reglas (turno,
// ausencias, que el operario no tenga dos servicios a la vez, calificar una sola vez) las valida
// el backend; aquí solo se llaman los endpoints.

export type ExecutionStatusCode = 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'WITH_ISSUE';

export interface WeekSlotDto {
  dayOfWeek: number; // 1 = lunes ... 7 = domingo
  startsAt: string; // HH:mm:ss
  endsAt: string;
}

// semana de lunes a domingo; los null son "sin datos" (ej. sin servicios la semana anterior)
export type PunctualityLevel = 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'NO_DATA';
export interface OperatorMetricsResponse {
  weekStart: string;
  weekEnd: string;
  completedServices: number;
  previousWeekServices: number;
  servicesTrendPercent: number | null;
  punctualityPercent: number | null;
  punctualityLevel: PunctualityLevel;
  revenue: number;
  workedHours: number;
  availableHours: number;
  occupancyPercent: number | null;
}

// los null son "sin datos": sin servicios la semana anterior o sin calificaciones
export interface TeamSummaryResponse {
  weekStart: string;
  weekEnd: string;
  totalOperators: number;
  activeOperators: number;
  availableToday: number;
  absentToday: number;
  completedServices: number;
  previousWeekServices: number;
  servicesTrendPercent: number | null;
  averageRating: number | null;
  ratingsCount: number;
}

// operario libre para un horario, como lo ve el cliente al reservar (RF-010)
export interface AvailableOperatorResponse {
  operatorId: number;
  firstName: string;
  averageRating: number | null;
  ratingsCount: number;
}

export interface OperatorResponse {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  active: boolean;
  hiredOn: string;
  week: WeekSlotDto[];
  averageRating: number | null;
  ratingsCount: number;
  completedServices: number;
}

export interface AbsenceResponse {
  id: number;
  startsAt: string;
  endsAt: string;
  reason: string;
}

export interface AssignmentResponse {
  bookingId: number;
  operatorId: number;
  operatorName: string;
  status: ExecutionStatusCode;
}

// reservas que todavía necesitan operario: la regla vive en operations, igual en la web y la app
export interface UnassignedResponse {
  count: number;
  bookingIds: number[];
}

// operario candidato para una reserva: available false trae el código del motivo
export interface CandidateResponse {
  operatorId: number;
  fullName: string;
  averageRating: number | null;
  ratingsCount: number;
  assigned: boolean;
  available: boolean;
  unavailableReason: 'OPERATOR_INACTIVE' | 'OPERATOR_NOT_ON_SHIFT' | 'OPERATOR_ABSENT' | 'OPERATOR_BUSY' | null;
}

export interface OperatorServiceResponse {
  bookingId: number;
  code: string;
  bookingStatus: string;
  date: string;
  startTime: string;
  endTime: string;
  services: string; // nombres ya escritos por el backend
  vehicle: string;
  plate: string;
  total: number;
  status: ExecutionStatusCode;
  startedAt: string | null;
  finishedAt: string | null;
  rating: number | null;
  comment: string | null;
  // desde cuándo se puede iniciar (operations-service: 15 minutos antes de la reserva)
  startableAt: string | null;
  // primer nombre del cliente (vacío si security-service no respondió)
  clientName?: string;
}

export interface RatingResponse {
  bookingId: number;
  bookingCode: string;
  date: string;
  services: string;
  vehicle: string;
  plate: string;
  rating: number;
  comment: string | null;
  ratedAt: string;
  operatorName: string;
  // primer nombre del cliente (lo ve el operario); vacío si security-service no lo devolvió
  clientName: string;
}

const base = { baseUrl: OPERATIONS_API_URL };

// especialidad y habilidades del operario (ficha del operario)
export type OperatorSkillLevel = 'CERTIFIED' | 'EXPERT' | 'ADVANCED';

export interface OperatorSkillDto {
  name: string;
  level: OperatorSkillLevel;
}

export interface OperatorProfileResponse {
  operatorId: number;
  specialty: string | null;
  skills: OperatorSkillDto[];
}

// operario que atiende una reserva del cliente (solo su primer nombre)
export interface BookingOperatorResponse {
  bookingId: number;
  operatorName: string;
}

export const operationsService = {
  /* ---------- admin ---------- */

  // resumen del equipo para la lista de operarios (lo calcula operations-service)
  teamSummary(): Promise<TeamSummaryResponse> {
    return request<TeamSummaryResponse>('GET', '/admin/operators/summary', base);
  },

  // RF-010: operarios libres para el horario que el cliente va a reservar
  availableOperators(date: string, time: string, minutes: number): Promise<AvailableOperatorResponse[]> {
    const query = `date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&minutes=${minutes}`;
    return request<AvailableOperatorResponse[]>('GET', `/operators/available?${query}`, base);
  },

  // métricas de la semana actual del operario (las calcula operations-service)
  operatorMetrics(id: number): Promise<OperatorMetricsResponse> {
    return request<OperatorMetricsResponse>('GET', `/admin/operators/${id}/metrics`, base);
  },

  operators(): Promise<OperatorResponse[]> {
    return request<OperatorResponse[]>('GET', '/admin/operators', base);
  },

  // especialidad y habilidades de todos los operarios
  operatorProfiles(): Promise<OperatorProfileResponse[]> {
    return request<OperatorProfileResponse[]>('GET', '/admin/operators/profiles', base);
  },

  // reemplaza la especialidad y la lista completa de habilidades
  updateOperatorProfile(id: number, specialty: string | null, skills: OperatorSkillDto[]): Promise<OperatorProfileResponse> {
    return request<OperatorProfileResponse>('PUT', `/admin/operators/${id}/profile`, { ...base, body: { specialty, skills } });
  },

  setActive(id: number, active: boolean): Promise<OperatorResponse> {
    return request<OperatorResponse>('PATCH', `/admin/operators/${id}/status`, { ...base, body: { active } });
  },

  // turno semanal completo (reemplaza el anterior)
  setAvailability(id: number, week: WeekSlotDto[]): Promise<OperatorResponse> {
    return request<OperatorResponse>('PUT', `/admin/operators/${id}/availability`, { ...base, body: { week } });
  },

  absences(id: number): Promise<AbsenceResponse[]> {
    return request<AbsenceResponse[]>('GET', `/admin/operators/${id}/absences`, base);
  },

  // fechas y horas en la hora del lavadero (aaaa-mm-ddTHH:mm:ss)
  addAbsence(id: number, startsAt: string, endsAt: string, reason: string): Promise<AbsenceResponse> {
    return request<AbsenceResponse>('POST', `/admin/operators/${id}/absences`, { ...base, body: { startsAt, endsAt, reason } });
  },

  removeAbsence(id: number, absenceId: number): Promise<void> {
    return request<void>('DELETE', `/admin/operators/${id}/absences/${absenceId}`, base);
  },

  assignments(from: string, to: string): Promise<AssignmentResponse[]> {
    return request<AssignmentResponse[]>('GET', '/admin/assignments', { ...base, query: { from, to } });
  },

  // quién se puede asignar a esa reserva (turno, ausencias, cruces y estado los calcula el backend)
  candidates(bookingId: number): Promise<CandidateResponse[]> {
    return request<CandidateResponse[]>('GET', `/admin/assignments/${bookingId}/candidates`, base);
  },

  assign(bookingId: number, operatorId: number): Promise<AssignmentResponse> {
    return request<AssignmentResponse>('PUT', `/admin/assignments/${bookingId}`, { ...base, body: { operatorId } });
  },

  unassigned(from: string, to: string): Promise<UnassignedResponse> {
    return request<UnassignedResponse>('GET', '/admin/assignments/unassigned', { ...base, query: { from, to } });
  },

  /* ---------- operario ---------- */

  // sin fechas: solo los de hoy
  myServices(from?: string, to?: string): Promise<OperatorServiceResponse[]> {
    const query: Record<string, string> = {};
    if (from) query.from = from;
    if (to) query.to = to;
    return request<OperatorServiceResponse[]>('GET', '/operator/services', { ...base, query });
  },

  start(bookingId: number): Promise<OperatorServiceResponse> {
    return request<OperatorServiceResponse>('POST', `/operator/services/${bookingId}/start`, { ...base, body: {} });
  },

  finish(bookingId: number): Promise<OperatorServiceResponse> {
    return request<OperatorServiceResponse>('POST', `/operator/services/${bookingId}/finish`, { ...base, body: {} });
  },

  myRatings(): Promise<RatingResponse[]> {
    return request<RatingResponse[]>('GET', '/operator/ratings', base);
  },

  /* ---------- cliente ---------- */

  rate(bookingId: number, rating: number, comment: string | null): Promise<RatingResponse> {
    return request<RatingResponse>('POST', `/ratings/${bookingId}`, { ...base, body: { rating, comment } });
  },

  givenRatings(): Promise<RatingResponse[]> {
    return request<RatingResponse[]>('GET', '/ratings/me', base);
  },

  // solo trae las reservas que ya tienen operario asignado
  myBookingOperators(): Promise<BookingOperatorResponse[]> {
    return request<BookingOperatorResponse[]>('GET', '/operators/my-bookings', base);
  },
};
