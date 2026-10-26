/// <reference types="jest" />
import { ApiError } from '../../../core/api/apiError';
import { AppAlert } from '../../../shared/components/feedback/AppAlert';
import { act, renderHook } from '../../../shared/testing/renderHook';
import { useForgotPasswordFlow } from './useForgotPasswordFlow';

// i18n guarda el idioma en AsyncStorage; en las pruebas va el mock de la librería
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
const mockT = (key: string) => key;
jest.mock('react-i18next', () => ({ ...jest.requireActual('react-i18next'), useTranslation: () => ({ t: mockT }) }));
jest.mock('../../../shared/components/feedback/AppAlert', () => ({ AppAlert: { alert: jest.fn() } }));
const mockAuth = { requestPasswordReset: jest.fn(), verifyPasswordResetCode: jest.fn(), resetPassword: jest.fn() };
jest.mock('../../../core/services/auth', () => ({ useAuthService: () => mockAuth }));

const alert = jest.mocked(AppAlert.alert);

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.requestPasswordReset.mockResolvedValue(undefined);
});

describe('recuperación con demasiados intentos (TOO_MANY_ATTEMPTS, SEC-12)', () => {
  it('avisa y ofrece pedir otro código, que se envía al mismo correo', async () => {
    mockAuth.verifyPasswordResetCode.mockRejectedValue(new ApiError('TOO_MANY_ATTEMPTS', 423));
    const hook = await renderHook(() => useForgotPasswordFlow());
    await act(async () => {
      await hook.result.handleEmailSent('ana@hotmail.com');
    });

    let verified = true;
    await act(async () => {
      verified = await hook.result.handleCodeVerified('123456');
    });
    expect(verified).toBe(false);

    const [, message, buttons] = alert.mock.calls[alert.mock.calls.length - 1];
    expect(message).toBe('API_ERRORS.TOO_MANY_ATTEMPTS');
    const requestNew = buttons?.find((button) => button.text === 'AUTH_FEEDBACK.REQUEST_NEW_CODE');
    expect(requestNew).toBeDefined();

    await act(async () => {
      requestNew?.onPress?.();
    });
    expect(mockAuth.requestPasswordReset).toHaveBeenLastCalledWith('ana@hotmail.com');
    expect(hook.result.step).toBe(2);
    await hook.unmount();
  });

  it('un código equivocado sigue mostrando solo el error, sin el botón nuevo', async () => {
    mockAuth.verifyPasswordResetCode.mockRejectedValue(new ApiError('INVALID_RESET_CODE', 400));
    const hook = await renderHook(() => useForgotPasswordFlow());
    await act(async () => {
      await hook.result.handleCodeVerified('000000');
    });
    const [, message, buttons] = alert.mock.calls[alert.mock.calls.length - 1];
    expect(message).toBe('API_ERRORS.INVALID_RESET_CODE');
    expect(buttons?.some((button) => button.text === 'AUTH_FEEDBACK.REQUEST_NEW_CODE')).toBe(false);
    await hook.unmount();
  });
});
