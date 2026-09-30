// Modelos y tipos del módulo de operarios
import { WeekDay } from './schedule';

// ---------------------------------------------------------------
// Estados y filtros
// ---------------------------------------------------------------

export type OperatorStatus = 'available' | 'in_service' | 'absent';
export const OPERATOR_STATUSES: OperatorStatus[] = ['available', 'in_service', 'absent'];

export type OperatorFilter = 'all' | OperatorStatus;
export const OPERATOR_FILTERS: OperatorFilter[] = ['all', ...OPERATOR_STATUSES];

export type ContractType = 'hired' | 'intern';

// ---------------------------------------------------------------
// Operario
// ---------------------------------------------------------------

// Disponibilidad de un día de la semana (horas en formato HH:mm de 24 h)
export interface AvailabilityDay {
  day: WeekDay;
  enabled: boolean; // false = el operario no trabaja ese día
  start: string;
  end: string;
}

// Período de incapacidad o permiso (fechas en formato ISO: YYYY-MM-DD)
export interface Absence {
  start: string;
  end: string;
  reason: string;
}

// Métricas semanales del operario
export interface OperatorStats {
  servicesTrend: number; // % vs semana anterior
  usedHours: number; // Horas ocupadas
  capacityHours: number; // Horas totales del cupo semanal
  punctuality: number; // Porcentaje
  revenue: number; // COP
  goalPercent: number; // % de la meta semanal
}

export interface Operator {
  id: string;
  code: string; // Ejemplo: OP-8492
  name: string;
  specialty: string;
  phone: string;
  email: string;
  status: OperatorStatus;
  bayId: string; // '' = sin bahía asignada
  rating: number;
  reviews: number;
  weeklyServices: number;
  contract: ContractType;
  tags: string[];
  availability: AvailabilityDay[];
  absence: Absence | null;
  stats: OperatorStats;
}

// Bahía en la que puede trabajar un operario
export interface WorkBay {
  id: string;
  name: string;
}

// ---------------------------------------------------------------
// Formularios
// ---------------------------------------------------------------

export interface OperatorFormValues {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  status: OperatorStatus;
  bayId: string;
  tags: string[];
}

export type AbsenceFormValues = Absence;

export interface AssignShiftValues {
  operatorId: string;
  status: OperatorStatus;
  bayId: string;
}

// ---------------------------------------------------------------
// Detalle del operario
// ---------------------------------------------------------------

export type ServiceStatus = 'completed' | 'in_progress' | 'scheduled';

// Servicio asignado al operario el día de hoy
export interface TodayService {
  id: string;
  operatorId: string;
  code: string; // Ejemplo: #8910
  vehicle: string;
  service: string;
  bayName: string;
  start: string;
  end: string;
  status: ServiceStatus;
}

export type SkillLevel = 'certified' | 'expert' | 'advanced';

export interface Skill {
  id: string;
  operatorId: string;
  name: string;
  level: SkillLevel;
}

// Números de las tarjetas de la lista
export interface OperatorsSummary {
  total: number;
  hired: number;
  interns: number;
  available: number;
  weeklyServices: number;
  servicesTrend: number;
  averageRating: number;
  totalReviews: number;
}

// ---------------------------------------------------------------
// Calendario del operario (operator-calendar de la web)
// ---------------------------------------------------------------

export type CalendarView = 'week' | 'day' | 'month';
export type CalendarBlockType = 'available' | 'service' | 'leave' | 'lunch';

// Bloque de tiempo de un día del calendario (horas HH:mm de 24 h)
export interface CalendarBlock {
  day: number; // 0 = lunes ... 5 = sábado
  start: string;
  end: string;
  type: CalendarBlockType;
  label: string;
  bay?: string;
}
