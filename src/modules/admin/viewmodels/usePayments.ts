import { useMemo, useRef, useState } from 'react';
import {
  ManualPaymentValues,
  Payment,
  PaymentFilters,
  PaymentMethod,
  PaymentStatsData,
} from '../models/payment';
import { CURRENT_AUDITOR, buildMockPayments } from '../services/paymentMock';
import { getCurrentTime } from '../utils/paymentUtils';
import { getTodayISO } from '../utils/reservationUtils';
import { useSharedState } from '../../../shared/hooks/useSharedState';

// Filtros sin ningún valor aplicado
export const EMPTY_PAYMENT_FILTERS: PaymentFilters = { search: '', method: '', status: '' };

// Prefijo de la referencia según el método de pago
const REFERENCE_PREFIX: Record<PaymentMethod, string> = {
  cash: 'EF',
  nequi: 'NQ',
  daviplata: 'DV',
  bancolombia: 'TR',
};

// Deja solo letras y números en minúscula (así "nq8841920" encuentra "NQ-8841920")
const normalize = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]/g, '');

// Hook con el estado y la lógica de la pantalla de pagos
export function usePayments() {
  // compartido con el inicio del admin (revisar pagos desde el dashboard)
  const [payments, setPayments] = useSharedState<Payment[]>('admin.payments', buildMockPayments);
  const [filters, setFilters] = useState<PaymentFilters>(EMPTY_PAYMENT_FILTERS);
  const nextNumber = useRef(4903); // Consecutivo para los códigos nuevos

  // Pagos que cumplen los filtros, del más reciente al más antiguo
  const filteredPayments = useMemo(() => {
    const query = normalize(filters.search);

    return payments
      .filter((item) => {
        // Búsqueda por cliente, documento, referencia, código o teléfono
        if (query) {
          const haystack = normalize(
            [item.customerName, item.document, item.reference, item.code, item.phone].join(' '),
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

  // Actualiza solo los filtros indicados
  const updateFilters = (partial: Partial<PaymentFilters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  const clearFilters = () => setFilters(EMPTY_PAYMENT_FILTERS);

  // Aprueba un pago pendiente
  const approvePayment = (id: string) =>
    setPayments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'approved', rejectionReason: '', auditedBy: CURRENT_AUDITOR }
          : item,
      ),
    );

  // Rechaza un pago guardando el motivo
  const rejectPayment = (id: string, reason: string) =>
    setPayments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'rejected', rejectionReason: reason, auditedBy: CURRENT_AUDITOR }
          : item,
      ),
    );

  // Registra un pago hecho en caja (queda aprobado porque ya se recibió)
  const createManualPayment = (values: ManualPaymentValues) => {
    const number = nextNumber.current;
    nextNumber.current += 1;

    const reference = `${REFERENCE_PREFIX[values.method]}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newPayment: Payment = {
      id: `pay-${number}`,
      code: `#PAG-${number}`,
      customerName: values.customerName,
      document: '',
      phone: '',
      email: '',
      reference,
      method: values.method,
      amount: values.amount,
      declaredAmount: values.amount,
      date: getTodayISO(),
      time: getCurrentTime(),
      serviceName: values.serviceName,
      vehicle: '',
      plate: '',
      reservationCode: '',
      scheduleStart: '',
      scheduleEnd: '',
      bay: '',
      operator: '',
      status: 'approved',
      rejectionReason: '',
      auditedBy: CURRENT_AUDITOR,
    };

    setPayments((prev) => [...prev, newPayment]);
  };

  return {
    payments,
    filteredPayments,
    filters,
    stats,
    updateFilters,
    clearFilters,
    approvePayment,
    rejectPayment,
    createManualPayment,
  };
}
