/// <reference types="jest" />
import { ApiError } from '../../../core/api/apiError';
import { bookingService } from '../../../core/services/booking/BookingService';
import { paymentService } from '../../../core/services/payments/PaymentService';
import { preferencesService } from '../../../core/services/users/PreferencesService';
import { AppAlert } from '../../../shared/components/feedback/AppAlert';
import { act, flush, renderHook } from '../../../shared/testing/renderHook';
import { useSettings } from './useSettings';

// t e i18n estables, como los de i18next
const mockT = (key: string) => key;
const mockI18n = { language: 'es' };
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT, i18n: mockI18n }) }));
jest.mock('../../../app/config/i18n', () => ({ setAppLanguage: jest.fn() }));
jest.mock('../../../app/theme', () => ({ useTheme: () => ({ themeName: 'green', setThemeName: jest.fn() }) }));
jest.mock('../../../shared/components/feedback/AppAlert', () => ({ AppAlert: { alert: jest.fn() } }));
jest.mock('../../../shared/services/establishmentCatalog', () => ({ refreshEstablishment: jest.fn() }));
jest.mock('../services/qrPicker', () => ({ pickQrImage: jest.fn() }));
jest.mock('../../../core/services/booking/BookingService', () => ({
  bookingService: { businessData: jest.fn(), saveBusinessData: jest.fn() },
}));
jest.mock('../../../core/services/payments/PaymentService', () => ({
  paymentService: { adminAccounts: jest.fn(), updateAccount: jest.fn(), createAccount: jest.fn() },
}));
jest.mock('../../../core/services/users/PreferencesService', () => ({
  preferencesService: { get: jest.fn(), saveNotificationChannels: jest.fn() },
}));

const business = jest.mocked(bookingService);
const payments = jest.mocked(paymentService);
const prefs = jest.mocked(preferencesService);
const alert = jest.mocked(AppAlert.alert);

const nequi = { id: 1, methodCode: 'NEQUI', methodName: 'Nequi', accountHolder: 'Lavadero', accountNumber: '300',
  qrImageUrl: null, instructions: null, active: true, requiresReceipt: true };

beforeEach(() => {
  jest.clearAllMocks();
  business.businessData.mockResolvedValue({} as never);
  payments.adminAccounts.mockResolvedValue([nequi]);
  prefs.get.mockResolvedValue({ theme: 'green-light', language: 'es', notificationsEnabled: true, emailRemindersEnabled: false, promotionsEnabled: true });
});

describe('useSettings: los fallos se ven (MOV-07)', () => {
  it('si no cargan las cuentas de pago se avisa con opción de reintentar', async () => {
    payments.adminAccounts.mockRejectedValue(new ApiError('NETWORK_ERROR', 0));

    const hook = await renderHook(() => useSettings());
    await flush();

    expect(hook.result.loadErrorKey).toBe('API_ERRORS.NETWORK_ERROR');

    payments.adminAccounts.mockResolvedValue([nequi]);
    await act(async () => {
      await hook.result.retryLoad();
    });
    expect(hook.result.loadErrorKey).toBeNull();
    expect(hook.result.payments).toHaveLength(1);
    await hook.unmount();
  });

  it('desactivar un medio de pago que payment-service rechaza muestra su mensaje', async () => {
    payments.updateAccount.mockRejectedValue(new ApiError('FORBIDDEN', 403));

    const hook = await renderHook(() => useSettings());
    await flush();
    await act(async () => {
      await hook.result.deletePaymentMethod('1');
    });

    expect(payments.updateAccount).toHaveBeenCalledWith(1, expect.objectContaining({ active: false }));
    expect(alert).toHaveBeenCalledWith('COMMON.ERROR', 'API_ERRORS.FORBIDDEN', undefined, { type: 'error' });
    await hook.unmount();
  });

  it('sin leer las preferencias de la cuenta no se guardan las de por defecto', async () => {
    prefs.get.mockRejectedValue(new ApiError('NETWORK_ERROR', 0));

    const hook = await renderHook(() => useSettings());
    await flush();
    await act(async () => {
      hook.result.togglePreference('promotions');
    });
    await flush();

    expect(prefs.saveNotificationChannels).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith('COMMON.ERROR', 'API_ERRORS.NETWORK_ERROR', undefined, { type: 'error' });
    await hook.unmount();
  });
});
