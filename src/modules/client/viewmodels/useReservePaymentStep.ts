import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiErrorCode, apiErrorKey, slotAlternatives } from '../../../core/api/apiError';
import { bookingService } from '../../../core/services/booking/BookingService';
import { BookingResponse, CreateBookingRequest, PaymentMode } from '../../../core/services/booking/booking.types';
// las mismas cuentas activas que usa la pantalla de pago (payment-service)
import { PaymentAccount, paymentService } from '../../../core/services/payments/PaymentService';
import { methodIdOf } from './useClientPayment';

// lo único que el paso necesita de la navegación: ir a pagar la reserva recién creada
export interface ReserveNavigation {
  navigate: (screen: 'ClientPayment', params: { bookingId: number }) => void;
}

// resultado de reservar: digital (ya se fue a la pantalla de pago), efectivo, o el error a mostrar.
// slotTaken = 409 SLOT_UNAVAILABLE (hay que volver a pedir las horas libres)
export type ReserveOutcome =
  | { kind: 'digital'; booking: BookingResponse }
  | { kind: 'cash'; booking: BookingResponse }
  | { kind: 'error'; message: string; slotTaken: boolean; cashLimit: boolean };

// contrato pago-reserva (26-10): el efectivo solo se ofrece si el lavadero tiene activa esa cuenta
export function paymentModesFor(accounts: PaymentAccount[]): PaymentMode[] {
  return accounts.some((account) => methodIdOf(account.methodCode) === 'CASH') ? ['DIGITAL', 'CASH'] : ['DIGITAL'];
}

// ViewModel del paso "¿Cómo vas a pagar?" del asistente de reserva: carga las cuentas activas,
// decide si se ofrece el efectivo, manda paymentMode al crear la reserva y, si es DIGITAL, lleva
// directo a la pantalla de pago de esa reserva (allí se ve el plazo para subir el comprobante)
export function useReservePaymentStep(navigation: ReserveNavigation) {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [chosenMode, setChosenMode] = useState<PaymentMode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    paymentService
      .accounts()
      .then((list) => {
        if (active) setAccounts(list);
      })
      // sin las cuentas no se sabe si hay efectivo: queda solo el pago digital
      .catch(() => undefined)
      .finally(() => {
        if (active) setAccountsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const modes = paymentModesFor(accounts);
  const cashAvailable = modes.includes('CASH');
  // si el efectivo deja de estar (o nunca estuvo) se descarta; con una sola opción se elige sola
  const paymentMode: PaymentMode | null = accountsLoading
    ? null
    : chosenMode && modes.includes(chosenMode)
      ? chosenMode
      : modes.length === 1
        ? modes[0]
        : null;

  const selectMode = useCallback((mode: PaymentMode) => setChosenMode(mode), []);

  // crea la reserva con el modo de pago elegido; null si todavía no se eligió o ya se está enviando
  const book = async (request: Omit<CreateBookingRequest, 'paymentMode'>): Promise<ReserveOutcome | null> => {
    if (!paymentMode || submitting) return null;
    setSubmitting(true);
    try {
      const booking = await bookingService.createBooking({ ...request, paymentMode });
      if (paymentMode === 'DIGITAL') {
        navigation.navigate('ClientPayment', { bookingId: booking.id });
        return { kind: 'digital', booking };
      }
      return { kind: 'cash', booking };
    } catch (error) {
      return {
        kind: 'error',
        message: t(apiErrorKey(error)),
        slotTaken: slotAlternatives(error) !== null,
        // 409 CASH_BOOKING_LIMIT: ya tiene una reserva activa en efectivo
        cashLimit: apiErrorCode(error) === 'CASH_BOOKING_LIMIT',
      };
    } finally {
      setSubmitting(false);
    }
  };

  return { accountsLoading, modes, cashAvailable, paymentMode, selectMode, submitting, book };
}
