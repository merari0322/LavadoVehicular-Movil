// datos de prueba del operario, los mismos de la web mientras no exista booking-service.
// Las fechas de la agenda se calculan desde hoy para que siempre haya servicios "de hoy".

import { RoleNotification } from '../../../shared/models/notification';
import { toISODate } from '../../../shared/utils/format';
import { OperatorReservation, RatingItem, ServiceHistoryItem } from '../models/operator';

// fecha a "offset" días de hoy en formato aaaa-mm-dd
function dayFromToday(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toISODate(date);
}

export const OPERATOR_RESERVATIONS: OperatorReservation[] = [
  { id: 1, code: 'SV-2098', date: dayFromToday(-2), time: '09:00', service: 'BASIC', client: 'Mario Casas', phone: '+57 310 456 7812', vehicle: 'CAR', vehicleName: 'Mazda 3', plate: 'ABC-123', durationMin: 30, paymentMethod: 'CASH', status: 'finalizado' },
  { id: 2, code: 'SV-2099', date: dayFromToday(-2), time: '15:00', service: 'FULL', client: 'Diana Ríos', phone: '+57 315 208 3391', vehicle: 'SUV', vehicleName: 'Toyota RAV4', plate: 'DEF-456', durationMin: 60, paymentMethod: 'CARD', status: 'finalizado' },
  { id: 3, code: 'SV-2100', date: dayFromToday(-1), time: '11:00', service: 'PREMIUM', client: 'Felipe Cruz', phone: '+57 301 774 1250', vehicle: 'CAR', vehicleName: 'Chevrolet Onix', plate: 'GHI-789', durationMin: 50, paymentMethod: 'PSE', status: 'finalizado' },
  { id: 4, code: 'SV-2101', date: dayFromToday(0), time: '08:00', service: 'PREMIUM', client: 'Carlos Méndez', phone: '+57 320 569 0487', vehicle: 'CAR', vehicleName: 'Honda Civic', plate: 'JKL-012', durationMin: 50, paymentMethod: 'NEQUI', status: 'finalizado' },
  { id: 5, code: 'SV-2102', date: dayFromToday(0), time: '10:00', service: 'BASIC', client: 'Ana Ruiz', phone: '+57 318 932 6614', vehicle: 'MOTO', vehicleName: 'Yamaha FZ 2.0', plate: 'XYZ-98D', durationMin: 25, paymentMethod: 'CASH', status: 'en_progreso' },
  { id: 6, code: 'SV-2103', date: dayFromToday(0), time: '13:30', service: 'FULL', client: 'Pedro López', phone: '+57 312 111 2233', vehicle: 'PICKUP', vehicleName: 'Ford F-150', plate: 'MNO-345', durationMin: 70, paymentMethod: 'CARD', status: 'pendiente' },
  { id: 7, code: 'SV-2104', date: dayFromToday(0), time: '16:00', service: 'PREMIUM', client: 'Sofía Herrera', phone: '+57 314 222 3344', vehicle: 'CAR', vehicleName: 'Nissan Sentra', plate: 'PQR-678', durationMin: 55, paymentMethod: 'NEQUI', status: 'pendiente' },
  { id: 8, code: 'SV-2105', date: dayFromToday(1), time: '09:30', service: 'BASIC', client: 'Julián Ortiz', phone: '+57 316 333 4455', vehicle: 'MOTO', vehicleName: 'Honda CB 190', plate: 'STU-12F', durationMin: 25, paymentMethod: 'CASH', status: 'pendiente' },
  { id: 9, code: 'SV-2106', date: dayFromToday(1), time: '14:00', service: 'PREMIUM', client: 'Laura Peña', phone: '+57 317 444 5566', vehicle: 'CAR', vehicleName: 'Kia Picanto', plate: 'VWX-901', durationMin: 50, paymentMethod: 'PSE', status: 'pendiente' },
  { id: 10, code: 'SV-2107', date: dayFromToday(2), time: '10:00', service: 'FULL', client: 'Ricardo Nova', phone: '+57 319 555 6677', vehicle: 'TRUCK', vehicleName: 'Toyota Prado', plate: 'YZA-234', durationMin: 70, paymentMethod: 'CARD', status: 'pendiente' },
  { id: 11, code: 'SV-2108', date: dayFromToday(4), time: '08:30', service: 'BASIC', client: 'Camila Torres', phone: '+57 311 666 7788', vehicle: 'CAR', vehicleName: 'Renault Logan', plate: 'BCD-567', durationMin: 30, paymentMethod: 'NEQUI', status: 'pendiente' },
];

export const OPERATOR_STATS = { unreadNotifications: 2, averageRating: 4.3 };

export const SERVICE_HISTORY: ServiceHistoryItem[] = [
  { id: 1, code: 'SV-1840', date: '2026-02-20', time: '09:00', service: 'PREMIUM', vehicle: 'CAR', plate: 'ABC-123', client: 'Laura Gómez', paymentMethod: 'CARD', amount: 45000, rating: 5, comment: 'Excelente servicio, me entregaron el carro a tiempo.', status: 'finalizado', reason: null },
  { id: 2, code: 'SV-1841', date: '2026-02-18', time: '14:30', service: 'BASIC', vehicle: 'MOTO', plate: 'XYZ-98D', client: 'Miguel Rojas', paymentMethod: 'PSE', amount: 18000, rating: 4, comment: null, status: 'finalizado', reason: null },
  { id: 3, code: 'SV-1842', date: '2026-02-15', time: '10:30', service: 'FULL', vehicle: 'TRUCK', plate: 'JKL-457', client: 'Andrea Salas', paymentMethod: 'CASH', amount: 38000, rating: 5, comment: 'Todo perfecto.', status: 'finalizado', reason: null },
  { id: 4, code: 'SV-1843', date: '2026-02-14', time: '11:15', service: 'PREMIUM', vehicle: 'CAR', plate: 'MNO-741', client: 'Juan Díaz', paymentMethod: 'CARD', amount: 45000, rating: null, comment: null, status: 'cancelado', reason: 'El cliente canceló por lluvia.' },
  { id: 5, code: 'SV-1844', date: '2026-02-10', time: '12:00', service: 'BASIC', vehicle: 'TRUCK', plate: 'PQR-369', client: 'Camila Torres', paymentMethod: 'NEQUI', amount: 22000, rating: null, comment: null, status: 'reasignado', reason: 'Reasignado a otro operario por sobrecupo.' },
  { id: 6, code: 'SV-1845', date: '2026-02-08', time: '08:45', service: 'FULL', vehicle: 'CAR', plate: 'STU-852', client: 'Ricardo Nova', paymentMethod: 'CARD', amount: 38000, rating: 5, comment: 'Volveré a traer mi carro.', status: 'finalizado', reason: null },
  { id: 7, code: 'SV-1846', date: '2026-02-05', time: '16:00', service: 'PREMIUM', vehicle: 'MOTO', plate: 'VWX-159', client: 'Sofía Herrera', paymentMethod: 'PSE', amount: 45000, rating: null, comment: null, status: 'cancelado', reason: 'El cliente no llegó a la sede a la hora reservada.' },
  { id: 8, code: 'SV-1847', date: '2026-02-02', time: '10:00', service: 'BASIC', vehicle: 'CAR', plate: 'YZA-753', client: 'Pedro López', paymentMethod: 'CASH', amount: 18000, rating: 4, comment: null, status: 'finalizado', reason: null },
];

export const RATINGS: RatingItem[] = [
  { id: 1, client: 'Carlos H.', service: 'PREMIUM', date: '2024-07-15', rating: 4, comment: 'Excelente trabajo, me entregaron el vehículo a tiempo y quedó impecable.', duration: '1h 30m', serviceId: 'SV-1234' },
  { id: 2, client: 'Ana M.', service: 'BASIC', date: '2024-07-14', rating: 5, comment: 'Muy buen servicio, el auto quedó reluciente. Lo recomiendo totalmente.', duration: '1h 0m', serviceId: 'SV-1233' },
  { id: 3, client: 'Pedro L.', service: 'FULL', date: '2024-07-12', rating: 5, comment: 'Increíble atención al detalle, superó mis expectativas.', duration: '2h 0m', serviceId: 'SV-1230' },
  { id: 4, client: 'María G.', service: 'PREMIUM', date: '2024-07-10', rating: 3, comment: 'Buen servicio, pero tuve que esperar un poco más de lo indicado.', duration: '1h 15m', serviceId: 'SV-1228' },
  { id: 5, client: 'Jorge D.', service: 'BASIC', date: '2024-07-08', rating: 5, comment: 'Rápido y eficiente. El auto quedó como nuevo.', duration: '45m', serviceId: 'SV-1225' },
  { id: 6, client: 'Sofía R.', service: 'FULL', date: '2024-07-05', rating: 4, comment: 'Muy buen trabajo en general, volveré a solicitar el servicio.', duration: '1h 45m', serviceId: 'SV-1220' },
];

export const OPERATOR_NOTIFICATIONS: RoleNotification[] = [
  { id: 1, icon: 'schedule', type: 'recordatorio', title: 'NOTIFICATIONS.NEW_SERVICE', desc: 'NOTIFICATIONS.NEW_SERVICE_DESC', date: '2025-03-12', time: '09:14', read: false },
  { id: 2, icon: 'check-circle', type: 'confirmacion', title: 'NOTIFICATIONS.STATUS_UPDATE', desc: 'NOTIFICATIONS.STATUS_UPDATE_DESC', date: '2025-03-11', time: '14:30', read: true },
  { id: 3, icon: 'warning', type: 'cancelacion', title: 'NOTIFICATIONS.CANCELLATION', desc: 'NOTIFICATIONS.CANCELLATION_DESC', date: '2025-03-10', time: '10:00', read: false },
  { id: 4, icon: 'chat', type: 'mensaje', title: 'NOTIFICATIONS.CLIENT_MESSAGE', desc: 'NOTIFICATIONS.CLIENT_MESSAGE_DESC', date: '2025-03-04', time: '16:45', read: true },
  { id: 5, icon: 'desktop-windows', type: 'sistema', title: 'NOTIFICATIONS.SYSTEM', desc: 'NOTIFICATIONS.SYSTEM_DESC', date: '2025-03-08', time: '08:00', read: true },
];
