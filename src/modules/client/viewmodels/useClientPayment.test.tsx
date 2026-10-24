/// <reference types="jest" />
import { act, flush, renderHook } from '../../../shared/testing/renderHook';
import { paymentService } from '../../../core/services/payments/PaymentService';
import { flowStepOf, useClientPayment } from './useClientPayment';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('../../../core/services/payments/receiptImage', () => ({ compressReceipt: jest.fn() }));
// t estable, como el de i18next (si cambiara en cada render, los efectos se repetirían sin fin)
const mockT = (key: string) => key;
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));

// la reserva a pagar: el total de booking-service NO es lo que se cobra (el cupón lo baja)
const mockBooking = {
  id: 123, code: 'RES-123', status: 'CONFIRMED', date: '2026-10-25', displayDate: '25/10/2026',
  timeRange: '08:00 - 08:45', services: ['Lavado'], vehicle: 'Mazda 3', plate: 'ABC123',
  subtotal: 40000, pointsDiscount: 0, total: 40000, paymentStatus: null, canPay: true, canCancel: true, canRate: false,
};
const mockBookingsVm = {
  bookings: [mockBooking], loading: false, loadError: null, reload: jest.fn(), cancel: jest.fn(), rate: jest.fn(),
};
jest.mock('./useClientBookings', () => ({ useClientBookings: () => mockBookingsVm }));

jest.mock('../../../core/services/payments/PaymentService', () => ({
  ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg'],
  paymentService: {
    accounts: jest.fn(),
    mine: jest.fn(),
    bookingAmountDue: jest.fn(),
    redeemCoupon: jest.fn(),
    removeCoupon: jest.fn(),
    report: jest.fn(),
  },
}));

const api = paymentService as jest.Mocked<typeof paymentService>;
const nequi = { id: 1, methodCode: 'NEQUI', methodName: 'Nequi', accountHolder: 'Lavadero', accountNumber: '300',
  qrImageUrl: null, instructions: null, active: true, requiresReceipt: true };
const coupon = { promotionId: 7, promotionCode: 'BIENVENIDA10', promotionName: 'Bienvenida 10 %', discountAmount: 4000 };

beforeEach(() => {
  jest.clearAllMocks();
  api.accounts.mockResolvedValue([nequi]);
  api.mine.mockResolvedValue([]);
});

describe('useClientPayment (E-08 / BIZ-02)', () => {
  it('al abrir muestra el monto y el cupón que dice payment-service, aunque se haya salido de la pantalla', async () => {
    api.bookingAmountDue.mockResolvedValue({ bookingId: 123, bookingTotal: 40000, appliedDiscounts: 4000, amountDue: 36000, redemption: coupon });

    const hook = await renderHook(() => useClientPayment(123));
    await flush();

    expect(api.bookingAmountDue).toHaveBeenCalledWith(123);
    expect(hook.result.total).toBe(36000);
    expect(hook.result.coupon).toEqual(coupon);
    // el monto pagado por defecto es el del servidor, no el total de la reserva
    expect(hook.result.paidAmountText).toBe('36000');
    await hook.unmount();
  });

  it('quitar el cupón llama al DELETE y usa el monto que devuelve el servidor', async () => {
    api.bookingAmountDue.mockResolvedValue({ bookingId: 123, bookingTotal: 40000, appliedDiscounts: 4000, amountDue: 36000, redemption: coupon });
    api.removeCoupon.mockResolvedValue({ bookingId: 123, bookingTotal: 40000, appliedDiscounts: 0, amountDue: 40000 });

    const hook = await renderHook(() => useClientPayment(123));
    await flush();
    await act(async () => {
      await hook.result.removeCoupon();
    });

    expect(api.removeCoupon).toHaveBeenCalledWith(123, 7);
    expect(hook.result.coupon).toBeNull();
    expect(hook.result.total).toBe(40000);
    await hook.unmount();
  });

  it('si el servidor no deja quitar el cupón (409), el cupón sigue y se muestra el error', async () => {
    api.bookingAmountDue.mockResolvedValue({ bookingId: 123, bookingTotal: 40000, appliedDiscounts: 4000, amountDue: 36000, redemption: coupon });
    api.removeCoupon.mockRejectedValue(new Error('409'));

    const hook = await renderHook(() => useClientPayment(123));
    await flush();
    await act(async () => {
      await hook.result.removeCoupon();
    });

    expect(hook.result.coupon).toEqual(coupon);
    expect(hook.result.total).toBe(36000);
    expect(hook.result.couponError).toBe('API_ERRORS.UNEXPECTED');
    await hook.unmount();
  });

  it('canjear un cupón vuelve a pedir el monto al servidor (no lo calcula el celular)', async () => {
    api.bookingAmountDue
      .mockResolvedValueOnce({ bookingId: 123, bookingTotal: 40000, appliedDiscounts: 0, amountDue: 40000, redemption: null })
      .mockResolvedValueOnce({ bookingId: 123, bookingTotal: 40000, appliedDiscounts: 4000, amountDue: 36000, redemption: coupon });
    api.redeemCoupon.mockResolvedValue({ ...coupon, newTotal: 36000 });

    const hook = await renderHook(() => useClientPayment(123));
    await flush();
    await act(async () => {
      hook.result.setCouponCode('bienvenida10');
    });
    await act(async () => {
      await hook.result.redeemCoupon();
    });

    expect(api.redeemCoupon).toHaveBeenCalledWith(123, 'BIENVENIDA10');
    expect(api.bookingAmountDue).toHaveBeenCalledTimes(2);
    expect(hook.result.total).toBe(36000);
    expect(hook.result.coupon?.promotionId).toBe(7);
    await hook.unmount();
  });

  it('sin respuesta de payment-service no hay total ni se deja pagar', async () => {
    api.bookingAmountDue.mockRejectedValue(new Error('caído'));

    const hook = await renderHook(() => useClientPayment(123));
    await flush();

    expect(hook.result.total).toBeNull();
    expect(hook.result.paymentError).toBe('API_ERRORS.UNEXPECTED');
    expect(hook.result.canConfirm).toBe(false);
    await hook.unmount();
  });

  it('el paso del pago sale del último pago de la reserva', () => {
    const pay = (status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REFUNDED', rejectionReason: string | null = null) =>
      ({ id: 1, status, amount: 1, rejectionReason, booking: { id: 123, code: 'RES-123' } });
    expect(flowStepOf([pay('APPROVED')], 123).step).toBe('APPROVED');
    expect(flowStepOf([pay('IN_REVIEW')], 123).step).toBe('VERIFYING');
    expect(flowStepOf([pay('REJECTED', 'Referencia ilegible')], 123)).toEqual({ step: 'PENDING', rejectionReason: 'Referencia ilegible' });
    expect(flowStepOf([], 123)).toEqual({ step: 'PENDING', rejectionReason: null });
  });
});
