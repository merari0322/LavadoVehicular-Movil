import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ManualPaymentValues,
  Payment,
  PaymentFilters,
  PaymentMethod,
  PaymentStatsData,
} from '../models/payment';
import { getTodayISO } from '../utils/reservationUtils';
import { useSharedState } from '../../../shared/hooks/useSharedState';
import { PaymentView, paymentService } from '../../../core/services/payments/PaymentService';

// Filtros sin ningún valor aplicado
export const EMPTY_PAYMENT_FILTERS: PaymentFilters = { search: '', method: '', status: '' };

// Deja solo letras y números en minúscula (así "nq8841920" encuentra "NQ-8841920")
const normalize = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]/g, '');

function methodOf(code: string | undefined): PaymentMethod {
  if (code === 'NEQUI') return 'nequi';
  if (code === 'DAVIPLATA') return 'daviplata';
  if (code === 'EFECTIVO') return 'cash';
  return 'bancolombia'; // transferencia
}

const pad = (n: number) => String(n).padStart(2, '0');

// pago de payment-service -> modelo que pintan las tarjetas y el modal de revisión
function toPayment(p: PaymentView): Payment {
  const reported = p.reportedAtUtc ? new Date(p.reportedAtUtc) : null;
  const status = p.status === 'APPROVED' ? 'approved' : p.status === 'REJECTED' || p.status === 'REFUNDED' ? 'rejected' : 'pending';
  return {
    id: String(p.id),
    code: `#PAG-${p.id}`,
    // el nombre del cliente lo tiene security-service; aquí se reconoce por la placa
    customerName: p.booking ? `${p.booking.vehicle} · ${p.booking.plate}`.trim() : '—',
    document: '',
    phone: '',
    email: '',
    reference: p.transactionReference ?? '',
    method: methodOf(p.account?.methodCode),
    amount: p.amount,
    declaredAmount: p.amount,
    date: reported ? `${reported.getFullYear()}-${pad(reported.getMonth() + 1)}-${pad(reported.getDate())}` : (p.booking?.date ?? getTodayISO()),
    time: reported ? `${pad(reported.getHours())}:${pad(reported.getMinutes())}` : '',
    serviceName: p.booking?.services ?? '',
    vehicle: p.booking?.vehicle ?? '',
    plate: p.booking?.plate ?? '',
    reservationCode: p.booking?.code ?? '',
    scheduleStart: p.booking?.startTime ?? '',
    scheduleEnd: '',
    bay: '',
    operator: '',
    status,
    rejectionReason: p.rejectionReason ?? '',
    auditedBy: '',
    receiptImage: p.receiptImage,
    payee: p.account?.accountHolder ?? '',
  };
}

// Hook con el estado y la lógica de la pantalla de pagos (payment-service)
export function usePayments() {
  // compartido con el inicio del admin (revisar pagos desde el dashboard)
  const [payments, setPayments] = useSharedState<Payment[]>('admin.payments', () => []);
  const [filters, setFilters] = useState<PaymentFilters>(EMPTY_PAYMENT_FILTERS);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    try {
      setPayments((await paymentService.adminList()).map(toPayment));
      setError(null);
    } catch (e) {
      setError(e);
    }
  }, [setPayments]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Pagos que cumplen los filtros, del más reciente al más antiguo
  const filteredPayments = useMemo(() => {
    const query = normalize(filters.search);

    return payments
      .filter((item) => {
        if (query) {
          const haystack = normalize(
            [item.customerName, item.reference, item.code, item.plate, item.reservationCode].join(' '),
          );
          if (!haystack.includes(query)) return false;
        }
        if (filters.method && item.method !== filters.method) return false;
        if (filters.status && item.status !== filters.status) return false;
        return true;
      })
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  }, [payments, filters]);

  // Estadísticas: los pendientes son todos, el resto solo cuenta lo de hoy
  const stats = useMemo<PaymentStatsData>(() => {
    const todays = payments.filter((item) => item.date === getTodayISO());
    const approvedToday = todays.filter((item) => item.status === 'approved');

    return {
      pending: payments.filter((item) => item.status === 'pending').length,
      approved: approvedToday.length,
      rejected: todays.filter((item) => item.status === 'rejected').length,
      collected: approvedToday.reduce((total, item) => total + item.amount, 0),
      transactions: todays.length,
    };
  }, [payments]);

  const updateFilters = (partial: Partial<PaymentFilters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  const clearFilters = () => setFilters(EMPTY_PAYMENT_FILTERS);

  // las acciones las valida payment-service; luego se recarga la lista.
  // Devuelven el error (o null) para que la pantalla lo muestre.
  const run = async (action: () => Promise<unknown>): Promise<unknown> => {
    try {
      await action();
      await reload();
      return null;
    } catch (e) {
      return e;
    }
  };

  const approvePayment = (id: string) => run(() => paymentService.approve(Number(id)));

  const rejectPayment = (id: string, reason: string) => run(() => paymentService.reject(Number(id), reason));

  // Pago recibido en caja para una reserva real (queda aprobado con su total)
  const createManualPayment = (values: ManualPaymentValues) =>
    run(() => paymentService.registerManual(values.bookingId, values.paymentAccountId));

  return {
    payments,
    filteredPayments,
    filters,
    stats,
    error,
    reload,
    updateFilters,
    clearFilters,
    approvePayment,
    rejectPayment,
    createManualPayment,
  };
}
