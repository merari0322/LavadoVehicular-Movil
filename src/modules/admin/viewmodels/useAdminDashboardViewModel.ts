import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '../../../core/services/auth';
import { DASHBOARD_TEXTS } from '../constants/dashboardTexts';
import { useReservationCatalog } from '../services/reservationCatalog';
import { OperatorStatus, OperatorStatusValue, RevenueDay } from '../types/dashboard.types';
import { addDays, getTodayISO } from '../utils/reservationUtils';
import { usePayments } from './usePayments';
import { useOperators } from './useOperators';
import { useReservations } from './useReservations';

// comparación con ayer (dato del reporte diario: todavía no hay un endpoint que lo calcule)
const VS_YESTERDAY = 3;

export function formatCOP(amount: number): string {
  return '$' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// etiqueta corta de la barra: 520000 -> $520k, 1100000 -> $1.1M
function shortAmount(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  return `$${Math.round(amount / 1000)}k`;
}

const STATUS_BY_OPERATOR: Record<string, OperatorStatusValue> = {
  available: 'available',
  in_service: 'busy',
  absent: 'leave',
};

// inicio del administrador: usa los mismos datos que Reservas, Pagos y Operarios
// (useSharedState), así lo que se haga aquí se ve en esas pantallas y al revés
export function useAdminDashboardViewModel() {
  const { t, i18n } = useTranslation();
  const { user } = useSession();
  const { reservations, assignOperator } = useReservations();
  const { payments, stats: paymentStats, approvePayment, rejectPayment } = usePayments();
  const { operators, getBayName } = useOperators();
  // bahías reales (las carga useReservations con loadReservationCatalog)
  const { bays } = useReservationCatalog();

  const todayISO = getTodayISO();
  const texts = DASHBOARD_TEXTS;

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(texts.dateLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    // cambia con el idioma
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const todays = useMemo(() => reservations.filter((item) => item.date === todayISO), [reservations, todayISO]);

  // reservas de hoy que todavía no tienen operario, en orden de hora
  const unassignedBookings = useMemo(
    () =>
      todays
        .filter((item) => !item.operatorId && item.status !== 'cancelled' && item.status !== 'completed')
        .sort((a, b) => a.time.localeCompare(b.time)),
    [todays],
  );

  const pendingPayments = useMemo(
    () =>
      payments
        .filter((item) => item.status === 'pending')
        .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
    [payments],
  );

  const operatorRows = useMemo<OperatorStatus[]>(
    () =>
      operators.map((item) => ({
        id: item.id,
        initials: item.name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join(''),
        name: item.name,
        role: item.specialty,
        status: STATUS_BY_OPERATOR[item.status] ?? 'available',
        bay: getBayName(item.bayId),
      })),
    // getBayName solo lee la lista fija de bahías
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [operators],
  );

  // ingresos reales de la semana (lunes a domingo): suma de los pagos aprobados de cada día
  const weeklyAmounts = useMemo<number[]>(() => {
    const todayIndex = (new Date().getDay() + 6) % 7;
    const weekDates = Array.from({ length: 7 }, (_, index) => addDays(index - todayIndex));
    return weekDates.map((date) =>
      payments
        .filter((item) => item.date === date && item.status === 'approved')
        .reduce((sum, item) => sum + item.amount, 0),
    );
  }, [payments]);

  // barras de la semana con los nombres cortos de los días en el idioma actual
  const weeklyRevenue = useMemo<RevenueDay[]>(() => {
    const days = t('CALENDAR.DAYS_SHORT', { returnObjects: true }) as string[];
    const todayIndex = (new Date().getDay() + 6) % 7;
    return weeklyAmounts.map((amount, index) => ({
      day: Array.isArray(days) ? days[index] : String(index + 1),
      amount,
      label: shortAmount(amount),
      isToday: index === todayIndex,
    }));
  }, [t, weeklyAmounts]);

  const maxRevenue = Math.max(1, ...weeklyAmounts);
  const weekTotal = weeklyAmounts.reduce((sum, amount) => sum + amount, 0);
  const busiestDay = weeklyRevenue[weeklyAmounts.indexOf(Math.max(...weeklyAmounts))]?.day ?? '';
  const barHeightPct = (amount: number) => Math.round((amount / maxRevenue) * 100);

  const countByStatus = (status: OperatorStatusValue) => operatorRows.filter((o) => o.status === status).length;
  const statusLabel = (status: OperatorStatusValue) => texts.operators.status[status];

  // bahías en estado ACTIVE del booking-service (el operario ya no queda fijo en una bahía,
  // ADR-015: contarlas por operario siempre daba 0)
  const activeBays = bays.filter((bay) => bay.status === 'ACTIVE').length;

  return {
    adminName: user?.firstName ?? '',
    today,
    stats: {
      bookingsToday: todays.length,
      vsYesterday: VS_YESTERDAY,
      servicesInProgress: todays.filter((item) => item.status === 'in_progress').length,
      activeBays,
      pendingPayments: pendingPayments.length,
      revenueToday: paymentStats.collected,
    },
    weeklyRevenue,
    weekTotal,
    busiestDay,
    barHeightPct,
    operators: operatorRows,
    operatorsFull: operators,
    countByStatus,
    statusLabel,
    pendingPayments,
    unassignedBookings,
    reservations,
    approvePayment,
    rejectPayment,
    assignOperator,
  };
}
