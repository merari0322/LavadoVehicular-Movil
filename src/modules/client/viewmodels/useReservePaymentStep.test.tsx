/// <reference types="jest" />
import { act, flush, renderHook } from '../../../shared/testing/renderHook';
import { ApiError } from '../../../core/api/apiError';
import { bookingService } from '../../../core/services/booking/BookingService';
import { paymentService } from '../../../core/services/payments/PaymentService';
import { paymentModesFor, useReservePaymentStep } from './useReservePaymentStep';

// useClientPayment (de donde sale methodIdOf) carga módulos nativos: se simulan como en su prueba
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('../../../core/services/payments/receiptImage', () => ({ compressReceipt: jest.fn() }));
// t estable, como el de i18next
const mockT = (key: string) => key;
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));

jest.mock('../../../core/services/booking/BookingService', () => ({ bookingService: { createBooking: jest.fn() } }));
jest.mock('../../../core/services/payments/PaymentService', () => ({
  ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg'],
  paymentService: { accounts: jest.fn() },
}));

const bookings = bookingService as jest.Mocked<typeof bookingService>;
const payments = paymentService as jest.Mocked<typeof paymentService>;

const account = (id: number, methodCode: string) => ({
  id, methodCode, methodName: methodCode, accountHolder: 'Lavadero', accountNumber: null,
  qrImageUrl: null, instructions: null, active: true, requiresReceipt: methodCode !== 'EFECTIVO',
});
const nequi = account(1, 'NEQUI');
const cash = account(2, 'EFECTIVO');
const request = { vehicleId: 4, serviceIds: [2], date: '2026-10-27', time: '09:00', notes: null, preferredOperatorId: null };
const created = { id: 55, code: 'RES-55', date: '2026-10-27', startTime: '09:00', total: 40000 } as never;

const navigation = { navigate: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useReservePaymentStep (contrato pago-reserva)', () => {
  it('el efectivo solo aparece si las cuentas activas del lavadero lo incluyen', () => {
    expect(paymentModesFor([nequi])).toEqual(['DIGITAL']);
    expect(paymentModesFor([nequi, cash])).toEqual(['DIGITAL', 'CASH']);
    expect(paymentModesFor([])).toEqual(['DIGITAL']);
  });

  it('sin cuenta de efectivo lo oculta y deja elegido el pago digital', async () => {
    payments.accounts.mockResolvedValue([nequi]);
    const hook = await renderHook(() => useReservePaymentStep(navigation));
    await flush();

    expect(payments.accounts).toHaveBeenCalled();
    expect(hook.result.cashAvailable).toBe(false);
    expect(hook.result.modes).toEqual(['DIGITAL']);
    expect(hook.result.paymentMode).toBe('DIGITAL');

    // aunque se pida efectivo, no se puede elegir si no está
    await act(async () => hook.result.selectMode('CASH'));
    expect(hook.result.paymentMode).toBe('DIGITAL');
    await hook.unmount();
  });

  it('con efectivo activo el cliente debe elegir antes de poder reservar', async () => {
    payments.accounts.mockResolvedValue([nequi, cash]);
    const hook = await renderHook(() => useReservePaymentStep(navigation));
    await flush();

    expect(hook.result.cashAvailable).toBe(true);
    expect(hook.result.paymentMode).toBeNull();
    let outcome: unknown;
    await act(async () => {
      outcome = await hook.result.book(request);
    });
    expect(outcome).toBeNull();
    expect(bookings.createBooking).not.toHaveBeenCalled();
    await hook.unmount();
  });

  it('si payment-service no responde queda solo el pago digital', async () => {
    payments.accounts.mockRejectedValue(new Error('caído'));
    const hook = await renderHook(() => useReservePaymentStep(navigation));
    await flush();

    expect(hook.result.accountsLoading).toBe(false);
    expect(hook.result.modes).toEqual(['DIGITAL']);
    await hook.unmount();
  });

  it('con DIGITAL manda paymentMode y navega a la pantalla de pago de esa reserva', async () => {
    payments.accounts.mockResolvedValue([nequi, cash]);
    bookings.createBooking.mockResolvedValue(created);
    const hook = await renderHook(() => useReservePaymentStep(navigation));
    await flush();

    await act(async () => hook.result.selectMode('DIGITAL'));
    let outcome: { kind: string } | null = null;
    await act(async () => {
      outcome = await hook.result.book(request);
    });

    expect(bookings.createBooking).toHaveBeenCalledWith({ ...request, paymentMode: 'DIGITAL' });
    expect(navigation.navigate).toHaveBeenCalledWith('ClientPayment', { bookingId: 55 });
    expect(outcome!.kind).toBe('digital');
    await hook.unmount();
  });

  it('con CASH manda paymentMode y no navega a pagar', async () => {
    payments.accounts.mockResolvedValue([nequi, cash]);
    bookings.createBooking.mockResolvedValue(created);
    const hook = await renderHook(() => useReservePaymentStep(navigation));
    await flush();

    await act(async () => hook.result.selectMode('CASH'));
    let outcome: { kind: string } | null = null;
    await act(async () => {
      outcome = await hook.result.book(request);
    });

    expect(bookings.createBooking).toHaveBeenCalledWith({ ...request, paymentMode: 'CASH' });
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(outcome!.kind).toBe('cash');
    await hook.unmount();
  });

  it('el 409 CASH_BOOKING_LIMIT devuelve su mensaje traducido', async () => {
    payments.accounts.mockResolvedValue([nequi, cash]);
    bookings.createBooking.mockRejectedValue(new ApiError('CASH_BOOKING_LIMIT', 409));
    const hook = await renderHook(() => useReservePaymentStep(navigation));
    await flush();

    await act(async () => hook.result.selectMode('CASH'));
    let outcome: unknown;
    await act(async () => {
      outcome = await hook.result.book(request);
    });

    expect(outcome).toEqual({ kind: 'error', message: 'API_ERRORS.CASH_BOOKING_LIMIT', slotTaken: false, cashLimit: true });
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(hook.result.submitting).toBe(false);
    await hook.unmount();
  });

  it('el 400 INVALID_PAYMENT_MODE devuelve su mensaje traducido', async () => {
    payments.accounts.mockResolvedValue([nequi]);
    bookings.createBooking.mockRejectedValue(new ApiError('INVALID_PAYMENT_MODE', 400));
    const hook = await renderHook(() => useReservePaymentStep(navigation));
    await flush();

    let outcome: unknown;
    await act(async () => {
      outcome = await hook.result.book(request);
    });

    expect(outcome).toEqual({ kind: 'error', message: 'API_ERRORS.INVALID_PAYMENT_MODE', slotTaken: false, cashLimit: false });
    await hook.unmount();
  });

  it('el 409 SLOT_UNAVAILABLE avisa que hay que volver a pedir las horas', async () => {
    payments.accounts.mockResolvedValue([nequi]);
    bookings.createBooking.mockRejectedValue(
      new ApiError('SLOT_UNAVAILABLE', 409, [], { code: 'SLOT_UNAVAILABLE', alternatives: ['10:00'] }),
    );
    const hook = await renderHook(() => useReservePaymentStep(navigation));
    await flush();

    let outcome: { kind: string; slotTaken?: boolean } | null = null;
    await act(async () => {
      outcome = await hook.result.book(request);
    });

    expect(outcome!.slotTaken).toBe(true);
    await hook.unmount();
  });
});
