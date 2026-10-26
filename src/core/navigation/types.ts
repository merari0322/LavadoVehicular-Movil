import type { ReservationStatus } from '../../modules/admin/models/reservation';

export type RootStackParamList = {
  // sin sesión
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  // cliente (mismas páginas que /client en la web)
  ClientHome: undefined;
  ClientProfile: undefined;
  ClientVehicles: undefined;
  ClientReserve: undefined;
  // sin bookingId paga la primera reserva activa (o la más reciente)
  ClientPayment: { bookingId?: number } | undefined;
  ClientHistory: undefined;
  ClientNotifications: undefined;
  ClientSettings: undefined;
  // operario (mismas páginas que /operator en la web)
  OperatorHome: undefined;
  OperatorProfile: undefined;
  OperatorSchedule: undefined;
  OperatorAssigned: undefined;
  OperatorHistory: undefined;
  OperatorRatings: undefined;
  OperatorNotifications: undefined;
  OperatorSettings: undefined;
  // administrador
  AdminDashboard: undefined;
  AdminOperators: undefined;
  // calendario de turnos de un operario (operators/:id/calendar en la web)
  AdminOperatorCalendar: { operatorId: string };
  AdminSchedule: undefined;
  AdminReports: undefined;
  AdminNotifications: undefined;
  AdminSettings: undefined;
  AdminManagement: undefined;
  AdminPayments: undefined;
  AdminProfile: undefined;
  AdminReservations: undefined;
  // reporte de inspección de una reserva (reservations/:id/inspection en la web); el resumen
  // pinta el encabezado mientras responde operations-service
  AdminInspection: { bookingId: string; summary: InspectionBookingSummary };
};

// datos de la reserva que ya tiene la pantalla de reservas al abrir la inspección
export interface InspectionBookingSummary {
  code: string;
  plate: string;
  vehicle: string;
  customerName: string;
  service: string;
  dateLabel: string;
  duration: number;
  status: ReservationStatus;
}
