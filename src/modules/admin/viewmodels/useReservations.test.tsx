/// <reference types="jest" />
import { ApiError } from '../../../core/api/apiError';
import { bookingService } from '../../../core/services/booking/BookingService';
import { operationsService } from '../../../core/services/operations/OperationsService';
import { act, flush, renderHook } from '../../../shared/testing/renderHook';
import { isReschedulable, nextStatuses, Reservation } from '../models/reservation';
import { useReservations } from './useReservations';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
const mockT = (key: string) => key;
// se deja el resto de react-i18next (i18n.ts lo usa al cargar los textos) y solo se fija t
jest.mock('react-i18next', () => ({ ...jest.requireActual('react-i18next'), useTranslation: () => ({ t: mockT }) }));
jest.mock('../../../shared/components/feedback/AppAlert', () => ({ AppAlert: { alert: jest.fn() } }));
const mockCatalog = { services: [], bays: [] };
jest.mock('../services/reservationCatalog', () => ({
  loadReservationCatalog: () => Promise.resolve(),
  useReservationCatalog: () => mockCatalog,
}));
jest.mock('../../../core/services/users/UserAdminService', () => ({ userAdminService: { listAccounts: () => Promise.resolve([]) } }));
jest.mock('../../../core/services/vehicles/VehicleService', () => ({ vehicleService: { adminFindByPlate: jest.fn() } }));
jest.mock('../../../core/services/booking/BookingService', () => ({
  bookingService: { adminBookings: jest.fn(), adminReschedule: jest.fn(), adminChangeStatus: jest.fn() },
}));
jest.mock('../../../core/services/operations/OperationsService', () => ({
  operationsService: {
    assignments: () => Promise.resolve([]),
    unassigned: () => Promise.resolve(null),
    toClose: () => Promise.resolve([]),
    assign: jest.fn(),
  },
}));

const booking = jest.mocked(bookingService);
const operations = jest.mocked(operationsService);

// reserva confirmada con bahía, como la devuelve booking-service
const confirmed = {
  id: 9, code: 'RES-9', ownerUserId: null, vehicle: null, services: [], date: '2026-10-30', startTime: '09:00',
  durationMinutes: 45, bay: { id: 1 }, status: 'CONFIRMED', notes: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  booking.adminBookings.mockResolvedValue([confirmed] as never);
  booking.adminReschedule.mockResolvedValue({} as never);
  booking.adminChangeStatus.mockResolvedValue({} as never);
  operations.assign.mockResolvedValue({} as never);
});

const edit = (current: Reservation, changes: Partial<Reservation>) => {
  const { id, code, ...values } = { ...current, ...changes };
  return values;
};

describe('transiciones de estado de una reserva (MOV-05, Booking.java)', () => {
  it('ofrece solo los cambios que acepta el backend', () => {
    expect(nextStatuses('scheduled', true)).toEqual(['confirmed', 'cancelled']);
    expect(nextStatuses('scheduled', false)).toEqual(['cancelled']);
    expect(nextStatuses('confirmed', true)).toEqual(['in_progress', 'no_show', 'cancelled']);
    expect(nextStatuses('in_progress', true)).toEqual(['completed']);
    expect(nextStatuses('completed', true)).toEqual([]);
    expect(isReschedulable('confirmed')).toBe(true);
    expect(isReschedulable('in_progress')).toBe(false);
  });
});

describe('useReservations.updateReservation no deja el guardado a medias (MOV-05)', () => {
  it('un cambio de estado no permitido se rechaza antes de llamar al backend', async () => {
    const hook = await renderHook(() => useReservations());
    await flush();
    const current = hook.result.reservations[0];

    await expect(hook.result.updateReservation('9', edit(current, { date: '2026-10-31', status: 'scheduled' })))
      .rejects.toMatchObject({ code: 'INVALID_STATUS_TRANSITION' });
    expect(booking.adminReschedule).not.toHaveBeenCalled();
    expect(booking.adminChangeStatus).not.toHaveBeenCalled();
    await hook.unmount();
  });

  it('si falla asignar el operario después de reprogramar, la fecha vuelve a la de antes', async () => {
    operations.assign.mockRejectedValue(new ApiError('OPERATOR_BUSY', 409));
    const hook = await renderHook(() => useReservations());
    await flush();
    const current = hook.result.reservations[0];

    let failure: unknown = null;
    await act(async () => {
      failure = await hook.result.updateReservation('9', edit(current, { date: '2026-10-31', operatorId: '4' })).catch((e: unknown) => e);
    });

    expect(failure).toMatchObject({ code: 'OPERATOR_BUSY' });
    expect(booking.adminReschedule).toHaveBeenNthCalledWith(1, 9, { date: '2026-10-31', time: '09:00', notes: null });
    expect(booking.adminReschedule).toHaveBeenNthCalledWith(2, 9, { date: '2026-10-30', time: '09:00', notes: null });
    await hook.unmount();
  });

  it('cancelar no reprograma ni asigna: solo cambia el estado', async () => {
    const hook = await renderHook(() => useReservations());
    await flush();
    const current = hook.result.reservations[0];

    await act(async () => {
      await hook.result.updateReservation('9', edit(current, { date: '2026-10-31', operatorId: '4', status: 'cancelled' }));
    });

    expect(booking.adminReschedule).not.toHaveBeenCalled();
    expect(operations.assign).not.toHaveBeenCalled();
    expect(booking.adminChangeStatus).toHaveBeenCalledWith(9, 'CANCELLED', 'OTHER');
    await hook.unmount();
  });
});
