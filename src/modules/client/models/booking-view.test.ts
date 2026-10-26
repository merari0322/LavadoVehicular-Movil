/// <reference types="jest" />
import en from '../../../app/config/locales/en.json';
import es from '../../../app/config/locales/es.json';
import fr from '../../../app/config/locales/fr.json';
import pt from '../../../app/config/locales/pt.json';
import { BookingResponse } from '../../../core/services/booking/booking.types';
import { toLocalTime } from '../../../shared/utils/format';
import { payBeforeOf, toClientBookingItem } from './booking-view';

// el plazo viaja como instante ISO-8601; se arma desde una hora local para que la prueba no
// dependa de la zona horaria del equipo donde corre
const deadline = new Date(2026, 9, 26, 10, 5).toISOString();

const booking = (overrides: Partial<BookingResponse> = {}): BookingResponse => ({
  id: 55, code: 'RES-55', status: 'SCHEDULED', date: '2026-10-26', startTime: '11:00', endTime: '11:45',
  durationMinutes: 45, scheduledStart: '2026-10-26T16:00:00Z', scheduledEnd: '2026-10-26T16:45:00Z',
  bay: null, vehicle: null, ownerUserId: 1, bookedBy: 1, services: [], subtotal: 40000,
  pointsDiscountAmount: 0, total: 40000, cancellationReason: null, notes: null, changeable: true, createdAt: null,
  paymentMode: 'DIGITAL', paymentDeadline: deadline, paymentReported: false,
  ...overrides,
});

describe('insignia "Paga antes de las HH:mm" (contrato pago-reserva)', () => {
  it('el plazo se muestra en la hora local del celular', () => {
    expect(toLocalTime(deadline)).toBe('10:05');
    expect(toLocalTime(null)).toBeNull();
    expect(toLocalTime('no-es-fecha')).toBeNull();
  });

  it('sale con la reserva activa, con plazo y sin comprobante reportado', () => {
    expect(payBeforeOf(booking())).toBe('10:05');
    expect(payBeforeOf(booking({ status: 'CONFIRMED' }))).toBe('10:05');
    expect(payBeforeOf(booking({ status: 'IN_PROGRESS' }))).toBe('10:05');
  });

  it('no sale si ya reportó el comprobante, si no hay plazo o si la reserva ya no está activa', () => {
    expect(payBeforeOf(booking({ paymentReported: true }))).toBeNull();
    expect(payBeforeOf(booking({ paymentMode: 'CASH', paymentDeadline: null }))).toBeNull();
    expect(payBeforeOf(booking({ status: 'CANCELLED' }))).toBeNull();
    expect(payBeforeOf(booking({ status: 'COMPLETED' }))).toBeNull();
    // reserva anterior al cambio: el backend no manda los campos nuevos
    expect(payBeforeOf(booking({ paymentMode: undefined, paymentDeadline: undefined, paymentReported: undefined }))).toBeNull();
  });

  it('la fila del cliente lleva el modo de pago, la insignia y el motivo de cancelación', () => {
    const item = toClientBookingItem(booking());
    expect(item.paymentMode).toBe('DIGITAL');
    expect(item.payBefore).toBe('10:05');

    const timedOut = toClientBookingItem(
      booking({ status: 'CANCELLED', cancellationReason: { code: 'PAYMENT_TIMEOUT', name: 'Pago no reportado' } }),
    );
    expect(timedOut.payBefore).toBeNull();
    expect(timedOut.cancellationReason?.code).toBe('PAYMENT_TIMEOUT');
    expect(toClientBookingItem(booking({ paymentMode: null })).paymentMode).toBeNull();
  });

  it('una reserva CASH no ofrece pagar: lleva el aviso de pago en efectivo', () => {
    const payable = { bookingId: 55, paymentStatus: null, payable: true } as never;
    const cashItem = toClientBookingItem(booking({ paymentMode: 'CASH', paymentDeadline: null }), payable);
    expect(cashItem.canPay).toBe(false);
    expect(cashItem.paysInCash).toBe(true);
    expect(toClientBookingItem(booking({ paymentMode: 'CASH', status: 'CANCELLED' }), payable).paysInCash).toBe(false);

    const digitalItem = toClientBookingItem(booking(), payable);
    expect(digitalItem.canPay).toBe(true);
    expect(digitalItem.paysInCash).toBe(false);
    // reserva anterior al cambio: como antes
    expect(toClientBookingItem(booking({ paymentMode: null }), payable).canPay).toBe(true);
  });

  it('la insignia y el plazo tienen texto en los 4 idiomas', () => {
    for (const locale of [es, en, fr, pt]) {
      expect(locale.PAYMENT.CASH_BOOKING_NOTICE).toBeTruthy();
    }
    for (const locale of [es, en, fr, pt]) {
      expect(locale.HISTORY_CARD.PAY_BEFORE).toContain('{{time}}');
      expect(locale.PAYMENT.DEADLINE_NOTICE).toContain('{{time}}');
      expect(locale.RESERVE.PAYMENT_STEP.CASH_NOTICE).toBeTruthy();
      expect(locale.CANCELLATION_REASONS.PAYMENT_TIMEOUT).toBeTruthy();
    }
  });
});
