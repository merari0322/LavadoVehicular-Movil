// Modelos y tipos del módulo de horarios y bahías

export type ScheduleTab = 'hours' | 'bays';
export const SCHEDULE_TABS: ScheduleTab[] = ['hours', 'bays'];

// ---------------------------------------------------------------
// Horario semanal
// ---------------------------------------------------------------

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export const WEEK_DAYS: WeekDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export interface DaySchedule {
  day: WeekDay;
  open: boolean; // false = día de descanso
  opening: string; // Formato HH:mm (24 h)
  closing: string; // Formato HH:mm (24 h)
  breakId: string; // '' = continuo (sin pausa)
}

// Pausas disponibles en el selector (el id es el mismo rango)
export interface BreakOption {
  id: string;
  start: string;
  end: string;
}

export const BREAK_OPTIONS: BreakOption[] = [
  { id: '12:00-13:00', start: '12:00', end: '13:00' },
  { id: '12:30-13:30', start: '12:30', end: '13:30' },
  { id: '13:00-14:00', start: '13:00', end: '14:00' },
];

// ---------------------------------------------------------------
// Excepciones y días especiales
// ---------------------------------------------------------------

export type ExceptionType = 'holiday' | 'special' | 'maintenance';
export const EXCEPTION_TYPES: ExceptionType[] = ['holiday', 'special', 'maintenance'];

export interface ScheduleException {
  id: string;
  date: string; // Formato ISO: YYYY-MM-DD
  type: ExceptionType;
  closedAllDay: boolean;
  opening: string; // Solo aplica si no está cerrado todo el día
  closing: string;
  description: string;
}

export type ExceptionFormValues = Omit<ScheduleException, 'id'>;

// ---------------------------------------------------------------
// Bahías
// ---------------------------------------------------------------

export type BayStatus = 'active' | 'maintenance' | 'inactive';
export const BAY_STATUSES: BayStatus[] = ['active', 'maintenance', 'inactive'];

export interface Bay {
  id: string;
  name: string;
  status: BayStatus;
  operatorId: string; // '' = sin asignar
}

export type BayFormValues = Omit<Bay, 'id'>;

// ---------------------------------------------------------------
// Historial de cambios
// ---------------------------------------------------------------

export interface HistoryEntry {
  id: string;
  title: string;
  detail: string;
  date: string; // Formato ISO: YYYY-MM-DD
  author: string;
}
