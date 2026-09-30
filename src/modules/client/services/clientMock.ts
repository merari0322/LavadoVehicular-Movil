// datos de prueba del cliente, los mismos que muestra la web mientras no existan
// booking-service (reservas, historial) ni commercial-service (pagos, promociones).
// Los vehículos NO están aquí: esos ya vienen del customer-service real.

import { RoleNotification } from '../../../shared/models/notification';
import { ClientHistoryItem, NextService } from '../models/client';

export const NEXT_SERVICE: NextService = {
  type: 'PREMIUM',
  vehicle: 'CAR',
  plate: 'ABC-123',
  date: '25/02/2026 10:00 AM',
  operator: 'Laura Gómez',
  status: 'CONFIRMED',
};

export const CLIENT_STATS = { activeReservations: 2, washesDone: 14 };

// beneficios y promociones (contenido comercial, vendrá del backend)
export const BENEFITS = [
  { title: '20% OFF en tu 5° lavado', description: 'Te faltan 1 servicio para desbloquearlo' },
  { title: 'Lavado Premium a precio Básico', description: 'Válido hasta el 30 de septiembre' },
];

export const LOYALTY = { current: 4, goal: 5 };

export const CLIENT_HISTORY: ClientHistoryItem[] = [
  {
    id: 1,
    serviceType: 'PREMIUM',
    date: '28/03/2026',
    extras: ['WAX', 'VACUUM'],
    assignmentType: 'MANUAL',
    operator: 'Juan',
    status: 'COMPLETED',
    price: 35000,
    paid: true,
    rating: null,
    ratingComment: '',
  },
  {
    id: 2,
    serviceType: 'BASIC',
    date: '16/12/2025',
    extras: ['WAX'],
    assignmentType: 'AUTO',
    operator: '',
    status: 'PENDING',
    price: 20000,
    paid: false,
    rating: null,
    ratingComment: '',
  },
];

// reserva que se está pagando en la pantalla de pagos
export const PAYMENT_RESERVATION = {
  code: 'RES-9420',
  serviceName: 'Lavado Premium Automóvil',
  vehicleModel: 'Mazda CX-30',
  plate: 'KLL-302',
  schedule: 'Hoy, 24 Octubre 2024 · 14:00 - 15:15',
  subtotal: 60000,
  discountPercent: 15,
  coupon: 'BIENVENIDO15',
};

// cuenta que recibe los pagos digitales
export const PAYEE = {
  name: 'Lavado Vehicular S.A.S.',
  key: '318 450 9988',
};

// notificaciones de prueba del cliente (mismas de la web; los textos son llaves de traducción)
export const CLIENT_NOTIFICATIONS: RoleNotification[] = [
  { id: 1, icon: 'schedule', type: 'recordatorio', title: 'NOTIFICATIONS.SERVICE_REMINDER_TITLE', desc: 'NOTIFICATIONS.SERVICE_REMINDER_DESC', date: '2025-03-12', time: '09:14', read: false },
  { id: 2, icon: 'schedule', type: 'recordatorio', title: 'NOTIFICATIONS.PENDING_PAYMENT_TITLE', desc: 'NOTIFICATIONS.PENDING_PAYMENT_DESC', date: '2025-03-11', time: '18:05', read: true },
  { id: 3, icon: 'sell', type: 'promocion', title: 'NOTIFICATIONS.PROMO_FULL_WASH_TITLE', desc: 'NOTIFICATIONS.PROMO_FULL_WASH_DESC', date: '2025-03-11', time: '14:30', read: false },
  { id: 4, icon: 'sell', type: 'promocion', title: 'NOTIFICATIONS.REFER_FRIEND_TITLE', desc: 'NOTIFICATIONS.REFER_FRIEND_DESC', date: '2025-03-09', time: '11:20', read: true },
  { id: 5, icon: 'check-circle', type: 'confirmacion', title: 'NOTIFICATIONS.RESERVATION_CONFIRMED', desc: 'NOTIFICATIONS.BOOKING_CONFIRMED_DESC', date: '2025-03-10', time: '10:00', read: false },
  { id: 6, icon: 'check-circle', type: 'confirmacion', title: 'NOTIFICATIONS.PAYMENT_APPROVED_TITLE', desc: 'NOTIFICATIONS.PAYMENT_APPROVED_DESC', date: '2025-03-08', time: '16:41', read: true },
  { id: 7, icon: 'warning', type: 'cancelacion', title: 'NOTIFICATIONS.CANCELLATION', desc: 'NOTIFICATIONS.CLIENT_CANCELLATION_DESC', date: '2025-03-07', time: '10:00', read: false },
  { id: 8, icon: 'chat', type: 'mensaje', title: 'NOTIFICATIONS.OPERATOR_MESSAGE_TITLE', desc: 'NOTIFICATIONS.OPERATOR_MESSAGE_DESC', date: '2025-03-04', time: '16:45', read: true },
  { id: 9, icon: 'desktop-windows', type: 'sistema', title: 'NOTIFICATIONS.SYSTEM', desc: 'NOTIFICATIONS.SYSTEM_DESC', date: '2025-03-03', time: '08:00', read: true },
];
