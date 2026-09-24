import { useMemo } from 'react';
import {
  DashboardStats,
  OperatorStatus,
  OperatorStatusValue,
  PendingPayment,
  RevenueDay,
  UnassignedBooking,
} from '../types/dashboard.types';

const ADMIN_NAME = 'Laura';

const STATS: DashboardStats = {
  bookingsToday: 18,
  vsYesterday: 3,
  servicesInProgress: 4,
  activeBays: 4,
  pendingPayments: 5,
  revenueToday: 680000,
};

const WEEKLY_REVENUE: RevenueDay[] = [
  { day: 'Lun', amount: 520000, label: '$520k' },
  { day: 'Mar', amount: 610000, label: '$610k' },
  { day: 'Mié', amount: 450000, label: '$450k' },
  { day: 'Jue', amount: 680000, label: '$680k', isToday: true },
  { day: 'Vie', amount: 790000, label: '$790k' },
  { day: 'Sáb', amount: 1100000, label: '$1.1M' },
  { day: 'Dom', amount: 670000, label: '$670k' },
];

const OPERATORS: OperatorStatus[] = [
  { initials: 'JD', name: 'Juan Díaz', role: 'Lavador Especialista', status: 'busy', bay: 'Bahía 2' },
  { initials: 'CR', name: 'Carlos Ruiz', role: 'Técnico Detailing', status: 'available', bay: '' },
  { initials: 'MG', name: 'Mateo Gómez', role: 'Tapicería e Interiores', status: 'leave', bay: '' },
];

const PENDING_PAYMENTS: PendingPayment[] = [
  { client: 'Andrés Morales', bank: 'Bancolombia', bankClass: 'bancolombia', service: 'Lavado Detallado + Encerado', reference: '#BC-98402', amount: 85000 },
  { client: 'Carolina Vega', bank: 'Nequi', bankClass: 'nequi', service: 'Combo Completo SUV', reference: '#NQ-44129', amount: 120000 },
  { client: 'Felipe Montoya', bank: 'Daviplata', bankClass: 'daviplata', service: 'Lavado Básico Sedán', reference: '#DV-11208', amount: 45000 },
];

const UNASSIGNED_BOOKINGS: UnassignedBooking[] = [
  { time: '15:00', bay: 'Bahía 3', client: 'Sofía Castro', vehicle: 'Mazda CX-30', service: 'Premium Especial', isUpcoming: true, icon: 'workspace_premium' },
  { time: '15:30', bay: 'Bahía 1', client: 'Diego Herrera', vehicle: 'Toyota Hilux', service: 'Desinfección + Tapicería', icon: 'sanitizer' },
  { time: '16:15', bay: 'Bahía 2', client: 'Mariana Gómez', vehicle: 'Renault Duster', service: 'Lavado General + Polichado', icon: 'auto_awesome' },
];

const STATUS_LABEL: Record<OperatorStatusValue, string> = {
  busy: 'Ocupado',
  available: 'Disponible',
  leave: 'Incapacidad',
};

export function formatCOP(amount: number): string {
  return '$' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function useAdminDashboardViewModel() {
  const today = useMemo(
    () =>
      new Date().toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  const maxRevenue = useMemo(() => Math.max(...WEEKLY_REVENUE.map((d) => d.amount)), []);
  const weekTotal = useMemo(() => WEEKLY_REVENUE.reduce((sum, d) => sum + d.amount, 0), []);

  const barHeightPct = (amount: number) => Math.round((amount / maxRevenue) * 100);

  const countByStatus = (status: OperatorStatusValue) =>
    OPERATORS.filter((o) => o.status === status).length;

  const statusLabel = (status: OperatorStatusValue) => STATUS_LABEL[status];

  return {
    adminName: ADMIN_NAME,
    today,
    stats: STATS,
    weeklyRevenue: WEEKLY_REVENUE,
    operators: OPERATORS,
    pendingPayments: PENDING_PAYMENTS,
    unassignedBookings: UNASSIGNED_BOOKINGS,
    weekTotal,
    barHeightPct,
    countByStatus,
    statusLabel,
  };
}
