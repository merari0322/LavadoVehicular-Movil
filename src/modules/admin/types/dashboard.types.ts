export interface RevenueDay {
  day: string;
  amount: number;
  label: string;
  isToday?: boolean;
}

export type OperatorStatusValue = 'busy' | 'available' | 'leave';

export interface OperatorStatus {
  initials: string;
  name: string;
  role: string;
  status: OperatorStatusValue;
  bay: string;
}

export interface PendingPayment {
  client: string;
  bank: string;
  bankClass: 'bancolombia' | 'nequi' | 'daviplata';
  service: string;
  reference: string;
  amount: number;
}

export interface UnassignedBooking {
  time: string;
  bay: string;
  client: string;
  vehicle: string;
  service: string;
  isUpcoming?: boolean;
  icon: string;
}

export interface DashboardStats {
  bookingsToday: number;
  vsYesterday: number;
  servicesInProgress: number;
  activeBays: number;
  pendingPayments: number;
  revenueToday: number;
}
