import { Bay, DaySchedule, HistoryEntry, ScheduleException } from '../models/schedule';

// Datos de ejemplo de horarios y bahías (TODO: reemplazar por datos de la API)

// TODO: reemplazar por el usuario autenticado
export const SCHEDULE_ACTOR = 'Laura Méndez';

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

// Los operarios salen de reservationMock (op-1 = Carlos Ruiz, op-3 = Juan Díaz)
export const INITIAL_BAYS: Bay[] = [
  { id: 'bay-1', name: 'Bahía 1', status: 'active', operatorId: 'op-3' },
  { id: 'bay-2', name: 'Bahía 2', status: 'active', operatorId: 'op-1' },
  { id: 'bay-3', name: 'Bahía 3', status: 'active', operatorId: '' },
  { id: 'bay-4', name: 'Bahía 4', status: 'maintenance', operatorId: '' },
];

export const INITIAL_HISTORY: HistoryEntry[] = [
  { id: 'his-1', title: 'Horario semanal actualizado', detail: '', date: '2026-09-15', author: SCHEDULE_ACTOR },
  { id: 'his-2', title: 'Excepción agregada', detail: 'Navidad', date: '2026-09-02', author: SCHEDULE_ACTOR },
  { id: 'his-3', title: 'Bahía en mantenimiento', detail: 'Bahía 4', date: '2026-08-20', author: SCHEDULE_ACTOR },
];
