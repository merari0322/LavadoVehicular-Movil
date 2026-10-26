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
  // A-11: el admin la marcó como no asistida; se ve igual que una cancelada
  BOOKING_NO_SHOW: 'ClientHistory',
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
  OPERATOR_SERVICE_CANCELLED: 'OperatorAssigned',
  OPERATOR_SERVICE_UNASSIGNED: 'OperatorAssigned',
  // terminó sin registrarse: en sus servicios lo puede iniciar y finalizar tarde
  OPERATOR_SERVICE_NOT_REGISTERED: 'OperatorAssigned',
  BOOKING_REMINDER: 'OperatorAssigned',
};

const ADMIN: RouteTable = {
  USER_WELCOME: 'AdminDashboard',
  ADMIN_BOOKING_CREATED: 'AdminReservations',
  ADMIN_BOOKING_RESCHEDULED: 'AdminReservations',
  ADMIN_BOOKING_CANCELLED: 'AdminReservations',
  ADMIN_BOOKING_UNASSIGNED: 'AdminReservations',
  // se cierra desde la tarjeta "Por cerrar" del inicio
  ADMIN_SERVICE_NOT_REGISTERED: 'AdminDashboard',
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

// texto del botón "Ir a..." de cada pantalla destino (llaves GO_TO.*)
const GO_TO_LABEL: Partial<Record<keyof RootStackParamList, string>> = {
  ClientHome: 'GO_TO.HOME',
  ClientHistory: 'GO_TO.HISTORY',
  OperatorHome: 'GO_TO.HOME',
  OperatorAssigned: 'GO_TO.ASSIGNED',
  AdminDashboard: 'GO_TO.HOME',
  AdminReservations: 'GO_TO.RESERVATIONS',
};

// botón "Ir a..." del detalle de una notificación: la pantalla de donde viene el aviso.
// null = no tiene apartado propio (mensajes del sistema) y el detalle solo trae "Cerrar"
export function goToForNotification(
  role: UserRole,
  type: string | null,
): { screen: keyof RootStackParamList; label: string } | null {
  const screen = type ? TABLES[role][type] : undefined;
  const label = screen ? GO_TO_LABEL[screen] : undefined;
  return screen && label ? { screen, label } : null;
}
