import { BayOption, Operator, Reservation, ServiceOption } from '../models/reservation';
import { addDays, getTodayISO } from '../utils/reservationUtils';

// ---------------------------------------------------------------
// Catálogos (servicios, bahías y operarios)
// ---------------------------------------------------------------

export const SERVICES: ServiceOption[] = [
  { id: 'basic', name: 'Lavado Básico', duration: 40 },
  { id: 'premium', name: 'Premium Automóvil', duration: 60 },
  { id: 'interior', name: 'Detallado Interior', duration: 90 },
  { id: 'wax', name: 'Encerado', duration: 45 },
  { id: 'suv', name: 'Completo SUV', duration: 90 },
];

export const BAYS: BayOption[] = [
  { id: 'bay-1', name: 'Bahía 1' },
  { id: 'bay-2', name: 'Bahía 2' },
  { id: 'bay-3', name: 'Bahía 3' },
  { id: 'bay-4', name: 'Bahía 4' },
];

export const OPERATORS: Operator[] = [
  { id: 'op-1', name: 'Carlos Ruiz' },
  { id: 'op-2', name: 'Mateo Gómez' },
  { id: 'op-3', name: 'Juan Díaz' },
  { id: 'op-4', name: 'Sofía Torres' },
];

// Búsquedas por id (devuelven undefined si el id está vacío o no existe)
export const getServiceById = (id: string) => SERVICES.find((item) => item.id === id);
export const getBayById = (id: string) => BAYS.find((item) => item.id === id);
export const getOperatorById = (id: string) => OPERATORS.find((item) => item.id === id);

// ---------------------------------------------------------------
// Reservas de ejemplo (TODO: reemplazar por datos de la API)
// ---------------------------------------------------------------

// Crea una reserva a partir de su número
const res = (number: number, data: Omit<Reservation, 'id' | 'code'>): Reservation => ({
  id: `res-${number}`,
  code: `#RES-${number}`,
  ...data,
});

export const buildMockReservations = (): Reservation[] => {
  const today = getTodayISO();

  return [
    res(8910, { customerName: 'Camilo Reyes', phone: '+57 316 774 0091', email: 'camilo.reyes@email.com', vehicle: 'Jeep Renegade', plate: 'WQX-115', serviceId: 'premium', date: today, time: '09:00', duration: 60, bayId: '', operatorId: '', status: 'cancelled', notes: '' }),
    res(8911, { customerName: 'Natalia Cárdenas', phone: '+57 313 556 8890', email: 'natalia.c@email.com', vehicle: 'Renault Logan', plate: 'DFT-247', serviceId: 'basic', date: today, time: '10:00', duration: 40, bayId: 'bay-1', operatorId: 'op-1', status: 'completed', notes: '' }),
    res(8912, { customerName: 'Andrés Molina', phone: '+57 310 222 4455', email: '', vehicle: 'Mazda CX-30', plate: 'JKL-908', serviceId: 'wax', date: today, time: '10:45', duration: 45, bayId: 'bay-2', operatorId: 'op-4', status: 'completed', notes: 'Cliente frecuente' }),
    res(8914, { customerName: 'Cristian Peña', phone: '+57 314 998 0021', email: 'cristian.p@email.com', vehicle: 'Ford Explorer', plate: 'YTR-330', serviceId: 'interior', date: today, time: '11:30', duration: 90, bayId: 'bay-3', operatorId: 'op-2', status: 'in_progress', notes: 'Tapicería con manchas' }),
    res(8915, { customerName: 'Laura Ramírez', phone: '+57 301 445 7788', email: 'laura.r@email.com', vehicle: 'Nissan Sentra', plate: 'GHT-556', serviceId: 'basic', date: today, time: '12:00', duration: 40, bayId: 'bay-1', operatorId: 'op-3', status: 'in_progress', notes: '' }),
    res(8916, { customerName: 'Carolina Vega', phone: '+57 320 118 6604', email: 'carolina.vega@email.com', vehicle: 'Kia Sportage', plate: 'PLM-472', serviceId: 'suv', date: today, time: '13:30', duration: 90, bayId: '', operatorId: '', status: 'confirmed', notes: '' }),
    res(8917, { customerName: 'Felipe Duarte', phone: '+57 315 777 3312', email: '', vehicle: 'Chevrolet Onix', plate: 'RTS-219', serviceId: 'premium', date: today, time: '15:00', duration: 60, bayId: '', operatorId: '', status: 'confirmed', notes: 'Llega 10 minutos antes' }),
    res(8918, { customerName: 'Valeria Ortiz', phone: '+57 302 664 1908', email: 'valeria.o@email.com', vehicle: 'Toyota Hilux', plate: 'MNB-604', serviceId: 'suv', date: today, time: '16:30', duration: 90, bayId: 'bay-4', operatorId: 'op-1', status: 'rescheduled', notes: '' }),
    res(8919, { customerName: 'Sebastián Lara', phone: '+57 318 903 5567', email: 'sebas.lara@email.com', vehicle: 'Volkswagen Golf', plate: 'ZXC-731', serviceId: 'wax', date: addDays(1), time: '09:30', duration: 45, bayId: 'bay-2', operatorId: 'op-4', status: 'confirmed', notes: '' }),
    res(8909, { customerName: 'Daniela Rojas', phone: '+57 311 450 2276', email: 'daniela.r@email.com', vehicle: 'Hyundai Tucson', plate: 'BVC-388', serviceId: 'interior', date: addDays(-1), time: '14:00', duration: 90, bayId: 'bay-3', operatorId: 'op-2', status: 'completed', notes: '' }),
  ];
};
