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
};
