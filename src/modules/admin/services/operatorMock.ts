import {
  AvailabilityDay,
  CalendarBlock,
  Operator,
  Skill,
  TodayService,
  WorkBay,
} from '../models/operator';
import { WEEK_DAYS, WeekDay } from '../models/schedule';

// Datos de ejemplo de operarios (TODO: reemplazar por datos de la API)

// Bahías en las que se puede asignar un operario
export const WORK_BAYS: WorkBay[] = [
  { id: 'bay-1', name: 'Bahía 1 (Doble)' },
  { id: 'bay-2', name: 'Bahía 2' },
  { id: 'bay-3', name: 'Bahía 3' },
];

// Horario base: lunes a viernes 08:00 - 18:00, sábado 08:00 - 14:00 y domingo descanso
const BASE_HOURS: Record<WeekDay, { start: string; end: string }> = {
  monday: { start: '08:00', end: '18:00' },
  tuesday: { start: '08:00', end: '18:00' },
  wednesday: { start: '08:00', end: '18:00' },
  thursday: { start: '08:00', end: '18:00' },
  friday: { start: '08:00', end: '18:00' },
  saturday: { start: '08:00', end: '14:00' },
  sunday: { start: '08:00', end: '18:00' },
};

// Crea la disponibilidad semanal, con horas distintas para los días indicados
export const buildAvailability = (
  custom: Partial<Record<WeekDay, { start: string; end: string }>> = {},
): AvailabilityDay[] =>
  WEEK_DAYS.map((day) => ({
    day,
    enabled: day !== 'sunday',
    ...BASE_HOURS[day],
    ...custom[day],
  }));

export const INITIAL_OPERATORS: Operator[] = [
  {
    id: 'op-1',
    code: 'OP-8492',
    name: 'Carlos Ruiz',
    specialty: 'Técnico Detailing Especializado & Corrección de Barniz',
    phone: '+57 314 789 2045',
    email: 'c.ruiz@lavadovehicular.co',
    status: 'available',
    bayId: 'bay-1',
    rating: 4.9,
    reviews: 84,
    weeklyServices: 18,
    contract: 'hired',
    tags: ['Pulido cerámico', 'Corrección barniz'],
    availability: buildAvailability({ wednesday: { start: '14:00', end: '18:00' } }),
    absence: null,
    stats: { servicesTrend: 12, usedHours: 38, capacityHours: 44, punctuality: 98.5, revenue: 1420000, goalPercent: 104 },
  },
  {
    id: 'op-3',
    code: 'OP-8493',
    name: 'Juan Díaz',
    specialty: 'Lavador Especialista',
    phone: '+57 315 220 3381',
    email: 'j.diaz@lavadovehicular.co',
    status: 'in_service',
    bayId: 'bay-2',
    rating: 4.8,
    reviews: 54,
    weeklyServices: 14,
    contract: 'hired',
    tags: ['Lavado en espuma', 'Secado hidro'],
    availability: buildAvailability(),
    absence: null,
    stats: { servicesTrend: 8, usedHours: 30, capacityHours: 44, punctuality: 97.2, revenue: 1120000, goalPercent: 96 },
  },
  {
    id: 'op-5',
    code: 'OP-8494',
    name: 'Andrés Mora',
    specialty: 'Lavado General & Encerado',
    phone: '+57 312 774 9012',
    email: 'a.mora@lavadovehicular.co',
    status: 'available',
    bayId: 'bay-3',
    rating: 4.7,
    reviews: 42,
    weeklyServices: 16,
    contract: 'hired',
    tags: ['Cera Carnauba', 'Limpieza vidrios'],
    availability: buildAvailability(),
    absence: null,
    stats: { servicesTrend: 10, usedHours: 34, capacityHours: 44, punctuality: 96.8, revenue: 1260000, goalPercent: 101 },
  },
  {
    id: 'op-2',
    code: 'OP-8495',
    name: 'Mateo Gómez',
    specialty: 'Tapicería e Interiores',
    phone: '+57 318 660 4127',
    email: 'm.gomez@lavadovehicular.co',
    status: 'absent',
    bayId: '',
    rating: 4.6,
    reviews: 38,
    weeklyServices: 0,
    contract: 'hired',
    tags: ['Limpieza a vapor', 'Hidratación cuero'],
    availability: buildAvailability(),
    absence: { start: '2026-09-28', end: '2026-10-05', reason: 'Permiso médico' },
    stats: { servicesTrend: 0, usedHours: 0, capacityHours: 44, punctuality: 95.4, revenue: 0, goalPercent: 0 },
  },
  {
    id: 'op-4',
    code: 'OP-8496',
    name: 'Sofía Torres',
    specialty: 'Detallado de Interiores',
    phone: '+57 320 118 5543',
    email: 's.torres@lavadovehicular.co',
    status: 'available',
    bayId: '',
    rating: 4.8,
    reviews: 96,
    weeklyServices: 20,
    contract: 'intern',
    tags: ['Aspirado profundo'],
    availability: buildAvailability(),
    absence: null,
    stats: { servicesTrend: 15, usedHours: 36, capacityHours: 44, punctuality: 98.1, revenue: 1380000, goalPercent: 103 },
  },
  {
    id: 'op-6',
    code: 'OP-8497',
    name: 'Santiago Vargas',
    specialty: 'Lavado Exterior',
    phone: '+57 301 905 2286',
    email: 's.vargas@lavadovehicular.co',
    status: 'in_service',
    bayId: '',
    rating: 4.9,
    reviews: 76,
    weeklyServices: 16,
    contract: 'intern',
    tags: ['Lavado a mano'],
    availability: buildAvailability(),
    absence: null,
    stats: { servicesTrend: 9, usedHours: 32, capacityHours: 44, punctuality: 97.6, revenue: 1180000, goalPercent: 98 },
  },
];

// Tendencia general de servicios de la semana (valor fijo de ejemplo)
export const SUMMARY_SERVICES_TREND = 14;

export const INITIAL_TODAY_SERVICES: TodayService[] = [
  { id: 'svc-1', operatorId: 'op-1', code: '#8910', vehicle: 'Mazda CX-30', service: 'Lavado Premium Especializado', bayName: 'Bahía 1', start: '08:00', end: '10:30', status: 'completed' },
  { id: 'svc-2', operatorId: 'op-1', code: '#8935', vehicle: 'BMW X3 (Especial)', service: 'Detailing Cerámico + Corrección', bayName: 'Bahía 1 (Doble)', start: '11:30', end: '14:00', status: 'in_progress' },
  { id: 'svc-3', operatorId: 'op-1', code: '#8962', vehicle: 'Mazda CX-30 · Sofía Castro', service: 'Desinfección Total & Ozono', bayName: 'Bahía 1', start: '14:30', end: '16:30', status: 'scheduled' },
  { id: 'svc-4', operatorId: 'op-3', code: '#8940', vehicle: 'Renault Logan', service: 'Lavado Básico', bayName: 'Bahía 2', start: '09:00', end: '09:40', status: 'completed' },
  { id: 'svc-5', operatorId: 'op-3', code: '#8951', vehicle: 'Kia Picanto', service: 'Lavado en espuma', bayName: 'Bahía 2', start: '10:15', end: '11:00', status: 'in_progress' },
  { id: 'svc-6', operatorId: 'op-5', code: '#8944', vehicle: 'Chevrolet Onix', service: 'Encerado a mano', bayName: 'Bahía 3', start: '10:00', end: '11:30', status: 'completed' },
  { id: 'svc-7', operatorId: 'op-5', code: '#8958', vehicle: 'Toyota Hilux', service: 'Lavado General', bayName: 'Bahía 3', start: '15:00', end: '16:00', status: 'scheduled' },
];

export const INITIAL_SKILLS: Skill[] = [
  { id: 'skl-1', operatorId: 'op-1', name: 'Detailing Cerámico 9H', level: 'certified' },
  { id: 'skl-2', operatorId: 'op-1', name: 'Limpieza tapicería a vapor', level: 'expert' },
  { id: 'skl-3', operatorId: 'op-1', name: 'Corrección de pintura en 3 pasos', level: 'advanced' },
  { id: 'skl-4', operatorId: 'op-3', name: 'Lavado en espuma activa', level: 'expert' },
  { id: 'skl-5', operatorId: 'op-3', name: 'Secado hidrofóbico', level: 'advanced' },
  { id: 'skl-6', operatorId: 'op-5', name: 'Encerado con cera Carnauba', level: 'certified' },
  { id: 'skl-7', operatorId: 'op-5', name: 'Limpieza de vidrios', level: 'advanced' },
];

// Bloques del calendario de cada operario: los mismos datos de prueba de la web
// (operators-store). El móvil solo los muestra; los calculará el backend.
// TODO: traerlos de booking-service cuando exista
export const CALENDAR_BLOCKS: Record<string, CalendarBlock[]> = {
  'op-1': [
    { day: 0, start: '08:00', end: '10:30', type: 'service', label: '#8910 · Mazda CX-30 · Lavado Premium', bay: 'Bahía 1' },
    { day: 0, start: '10:30', end: '13:00', type: 'available', label: 'Disponible' },
    { day: 0, start: '13:00', end: '14:00', type: 'lunch', label: 'Almuerzo' },
    { day: 0, start: '14:00', end: '16:30', type: 'available', label: 'Disponible' },
    { day: 1, start: '08:00', end: '11:30', type: 'service', label: '#8935 · BMW X3 · Detailing Cerámico', bay: 'Bahía 1 (Doble)' },
    { day: 1, start: '11:30', end: '13:00', type: 'available', label: 'Disponible' },
    { day: 1, start: '13:00', end: '14:00', type: 'lunch', label: 'Almuerzo' },
    { day: 1, start: '14:00', end: '17:00', type: 'service', label: '#8948 · Kia Sportage · Encerado Orbital', bay: 'Bahía 2' },
    { day: 2, start: '08:00', end: '13:00', type: 'leave', label: 'Permiso médico · Control oftalmológico' },
    { day: 2, start: '13:00', end: '14:00', type: 'lunch', label: 'Almuerzo' },
    { day: 2, start: '14:00', end: '18:00', type: 'available', label: 'Reincorpora tras cita médica' },
    { day: 3, start: '08:00', end: '11:00', type: 'service', label: '#8955 · Renault Duster · Lavado Express', bay: 'Bahía 1' },
    { day: 3, start: '11:00', end: '13:00', type: 'available', label: 'Disponible' },
    { day: 3, start: '13:00', end: '14:00', type: 'lunch', label: 'Almuerzo' },
    { day: 3, start: '14:00', end: '16:30', type: 'service', label: '#8921 · Sofía Castro · Mazda CX-30', bay: 'Bahía 1 (Doble)' },
    { day: 3, start: '16:30', end: '18:00', type: 'available', label: 'Disponible' },
    { day: 4, start: '08:00', end: '12:00', type: 'available', label: 'Mañana libre' },
    { day: 4, start: '12:00', end: '13:00', type: 'service', label: '#8960 · Chevrolet Spark', bay: 'Bahía 1' },
    { day: 4, start: '13:00', end: '14:00', type: 'lunch', label: 'Almuerzo' },
    { day: 4, start: '14:00', end: '17:30', type: 'service', label: '#8962 · Ford Explorer · Detailing Interior', bay: 'Bahía 1' },
    { day: 5, start: '08:00', end: '11:00', type: 'service', label: '#8970 · Mercedes G', bay: 'Bahía 2' },
    { day: 5, start: '11:00', end: '14:00', type: 'available', label: 'Disponible fin de semana' },
  ],
  'op-3': [{ day: 0, start: '08:00', end: '18:00', type: 'service', label: 'Turno completo · Bahía 2', bay: 'Bahía 2' }],
  'op-5': [{ day: 0, start: '08:00', end: '18:00', type: 'available', label: 'Disponible' }],
  'op-2': [{ day: 0, start: '08:00', end: '18:00', type: 'leave', label: 'Incapacidad médica' }],
  'op-4': [{ day: 0, start: '08:00', end: '18:00', type: 'available', label: 'Disponible' }],
  'op-6': [{ day: 0, start: '08:00', end: '18:00', type: 'service', label: 'Turno completo · Bahía 3', bay: 'Bahía 3' }],
};
