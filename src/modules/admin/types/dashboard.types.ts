export interface RevenueDay {
  day: string;
  amount: number;
  label: string;
  isToday?: boolean;
}

export type OperatorStatusValue = 'busy' | 'available' | 'leave';

// operario resumido para la tarjeta "Estado de operarios"
export interface OperatorStatus {
  id: string;
  initials: string;
  name: string;
  role: string;
  status: OperatorStatusValue;
  bay: string;
}

export interface DashboardStats {
  bookingsToday: number;
  vsYesterday: number;
  servicesInProgress: number;
  activeBays: number;
  pendingPayments: number;
  revenueToday: number;
}
