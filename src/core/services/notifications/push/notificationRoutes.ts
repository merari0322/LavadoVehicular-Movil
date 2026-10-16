import type { UserRole } from '../../auth';
import type { RootStackParamList } from '../../../navigation/types';

// pantalla que se abre al tocar una push. Solo navegación: el texto y la regla de a quién se
// avisa los decide el backend; aquí solo se elige dónde se ve mejor cada tipo de aviso.
export interface NotificationRoute {
  screen: keyof RootStackParamList;
}

type RouteTable = Partial<Record<string, keyof RootStackParamList>>;

const CLIENT: RouteTable = {
  USER_WELCOME: 'ClientHome',
  BOOKING_CREATED: 'ClientHistory',
  BOOKING_CONFIRMED: 'ClientHistory',
  BOOKING_CANCELLED: 'ClientHistory',
  BOOKING_REMINDER: 'ClientHistory',
  OPERATOR_ASSIGNED: 'ClientHistory',
  SERVICE_STARTED: 'ClientHistory',
  SERVICE_COMPLETED: 'ClientHistory',
  INSPECTION_REPORT: 'ClientHistory',
  // en el historial está el botón para pagar o volver a reportar el pago de cada reserva
  PAYMENT_CONFIRMED: 'ClientHistory',
  PAYMENT_REJECTED: 'ClientHistory',
  PAYMENT_REFUNDED: 'ClientHistory',
  // puntos y cupones se ven en el inicio
  LOYALTY_POINTS_EARNED: 'ClientHome',
  PROMOTION_AVAILABLE: 'ClientHome',
  PROMOTION_REDEEMED: 'ClientHome',
};

const OPERATOR: RouteTable = {
  USER_WELCOME: 'OperatorHome',
  OPERATOR_ASSIGNED: 'OperatorAssigned',
  OPERATOR_SERVICE_RESCHEDULED: 'OperatorAssigned',
  BOOKING_REMINDER: 'OperatorAssigned',
};

const ADMIN: RouteTable = {
  USER_WELCOME: 'AdminDashboard',
  ADMIN_BOOKING_CREATED: 'AdminReservations',
  ADMIN_BOOKING_RESCHEDULED: 'AdminReservations',
  ADMIN_BOOKING_CANCELLED: 'AdminReservations',
  ADMIN_BOOKING_UNASSIGNED: 'AdminReservations',
};

const TABLES: Record<UserRole, RouteTable> = { CLIENT, OPERATOR, ADMIN };

// si el tipo no tiene pantalla propia (o llega uno nuevo que la app aún no conoce), la bandeja
const INBOX: Record<UserRole, keyof RootStackParamList> = {
  CLIENT: 'ClientNotifications',
  OPERATOR: 'OperatorNotifications',
  ADMIN: 'AdminNotifications',
};

export function routeForNotification(role: UserRole, type: string | null): NotificationRoute {
  const screen = (type && TABLES[role][type]) || INBOX[role];
  return { screen };
}
