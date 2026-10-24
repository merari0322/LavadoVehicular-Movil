/// <reference types="jest" />
import { cancelledBookingAction } from './payment';

describe('pagos de reservas canceladas (BIZ-07)', () => {
  it('aprobado: reembolsar; en revisión: rechazar; sin cancelar o ya cerrado: nada', () => {
    expect(cancelledBookingAction({ status: 'approved', bookingCancelled: true })).toBe('refund');
    expect(cancelledBookingAction({ status: 'pending', bookingCancelled: true })).toBe('reject');
    expect(cancelledBookingAction({ status: 'rejected', bookingCancelled: true })).toBeNull();
    expect(cancelledBookingAction({ status: 'approved', bookingCancelled: false })).toBeNull();
  });
});
