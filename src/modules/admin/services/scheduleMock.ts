import { Bay, DaySchedule, ScheduleException } from '../models/schedule';

// Valores de arranque mientras useSchedule() carga el horario, las excepciones, las bahías y el
// historial reales del booking-service (migraciones 005, 018, 021 y 022); la primera carga los
// reemplaza a todos, así la pantalla nunca se ve vacía.

export const INITIAL_WEEK: DaySchedule[] = [
  { day: 'monday', open: true, opening: '07:30', closing: '18:30', breakId: '' },
  { day: 'tuesday', open: true, opening: '07:30', closing: '18:30', breakId: '' },
  { day: 'wednesday', open: true, opening: '07:30', closing: '18:30', breakId: '' },
  { day: 'thursday', open: true, opening: '07:30', closing: '18:30', breakId: '' },
  { day: 'friday', open: true, opening: '07:30', closing: '19:00', breakId: '' },
  { day: 'saturday', open: true, opening: '08:00', closing: '18:00', breakId: '' },
  { day: 'sunday', open: false, opening: '08:00', closing: '14:00', breakId: '' },
];

export const INITIAL_EXCEPTIONS: ScheduleException[] = [
  { id: 'exc-1', date: '2026-11-11', type: 'holiday', closedAllDay: true, opening: '09:00', closing: '14:00', description: 'Día de la Independencia de Cartagena' },
  { id: 'exc-2', date: '2026-12-08', type: 'special', closedAllDay: false, opening: '09:00', closing: '14:00', description: 'Inmaculada Concepción · Jornada corta' },
  { id: 'exc-3', date: '2026-12-25', type: 'holiday', closedAllDay: true, opening: '09:00', closing: '14:00', description: 'Navidad - No laboral obligatorio' },
];

export const INITIAL_BAYS: Bay[] = [
  { id: 'bay-1', name: 'Bahía 1', status: 'active' },
  { id: 'bay-2', name: 'Bahía 2', status: 'active' },
  { id: 'bay-3', name: 'Bahía 3', status: 'active' },
  { id: 'bay-4', name: 'Bahía 4', status: 'maintenance' },
];
