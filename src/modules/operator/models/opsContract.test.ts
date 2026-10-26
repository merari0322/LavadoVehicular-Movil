/// <reference types="jest" />
import { ApiError } from '../../../core/api/apiError';
import { NotificationResponse, toRoleNotification } from '../../../core/services/notifications/NotificationService';
import { routeForNotification } from '../../../core/services/notifications/push/notificationRoutes';
import { OperatorReservation, canStartNow, startWindow } from './operator';

// i18n guarda el idioma en AsyncStorage; en las pruebas va el mock de la librería
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const service = (startableAt: string | null, startableUntil: string | null) =>
  ({ id: 1, status: 'pendiente', startableAt, startableUntil }) as unknown as OperatorReservation;

describe('contrato final de operations', () => {
  it('"Iniciar" solo se habilita dentro de la ventana startableAt..startableUntil', () => {
    const now = Date.parse('2026-10-24T15:00:00Z');
    expect(startWindow(service('2026-10-24T16:00:00Z', '2026-10-24T21:00:00Z'), now)).toBe('early');
    expect(startWindow(service('2026-10-24T14:00:00Z', '2026-10-24T19:00:00Z'), now)).toBe('open');
    expect(startWindow(service('2026-10-24T08:00:00Z', '2026-10-24T13:00:00Z'), now)).toBe('late');
    // un backend que todavía no manda startableUntil no bloquea
    expect(startWindow(service('2026-10-24T08:00:00Z', null), now)).toBe('open');
    expect(canStartNow(service('2000-01-01T00:00:00Z', '2000-01-01T04:00:00Z'))).toBe(false);
  });

  it('los códigos nuevos de operations tienen su mensaje', () => {
    for (const code of ['SERVICE_TOO_LATE', 'NOTIFICATION_NOT_SENT', 'SECURITY_SERVICE_UNAVAILABLE', 'DATABASE_UNAVAILABLE']) {
      expect(new ApiError(code, code === 'SERVICE_TOO_LATE' ? 409 : 503).messageKey).toBe(`API_ERRORS.${code}`);
    }
  });

  it('BOOKING_NO_SHOW se ve y se abre como una cancelación; un tipo desconocido no rompe la bandeja', () => {
    expect(routeForNotification('CLIENT', 'BOOKING_NO_SHOW').screen).toBe(routeForNotification('CLIENT', 'BOOKING_CANCELLED').screen);
    expect(routeForNotification('CLIENT', 'ALGO_NUEVO').screen).toBe('ClientNotifications');

    const base = { id: 1, title: 'T', message: 'M', referenceEntity: null, referenceId: null, read: false, readAt: null,
      sentAt: '2026-10-24T15:00:00Z' };
    const noShow = toRoleNotification({ ...base, type: 'BOOKING_NO_SHOW', category: undefined } as unknown as NotificationResponse);
    const cancelled = toRoleNotification({ ...base, type: 'BOOKING_CANCELLED', category: 'CANCELLATION' });
    expect(noShow.type).toBe(cancelled.type);
    expect(noShow.icon).toBe(cancelled.icon);

    const unknown = toRoleNotification({ ...base, type: 'ALGO_NUEVO', category: 'OTRA' } as unknown as NotificationResponse);
    expect(unknown.type).toBe('sistema');
    expect(unknown.icon).toBeTruthy();
  });
});
