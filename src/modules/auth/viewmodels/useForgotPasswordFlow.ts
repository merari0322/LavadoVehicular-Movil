import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthService } from '../../../core/services/auth';
import { apiErrorCode, apiErrorKey } from '../../../core/api/apiError';
import { ForgotPasswordStep } from '../types/auth.types';
import { AppAlert } from '../../../shared/components/feedback/AppAlert';

// mismo rol que ForgotPasswordComponent en la web: orquesta los 3 pasos contra el backend.
// El código verificado en el paso 2 se guarda porque el backend lo pide de nuevo en el paso 3.
export function useForgotPasswordFlow() {
  const authService = useAuthService();
  const { t } = useTranslation();

  const [step, setStep] = useState<ForgotPasswordStep>(1);
  const [email, setEmail] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // el error queda en el formulario y además se avisa con un modal
  const showError = useCallback((title: string, message: string) => {
    setErrorMessage(message);
    AppAlert.alert(title, message, [{ text: t('AUTH_FEEDBACK.OK') }], { type: 'error' });
  }, [t]);

  // el servidor responde igual exista o no la cuenta (no revela correos registrados)
  const handleEmailSent = useCallback(
    async (submittedEmail: string) => {
      setSubmitting(true);
      setErrorMessage(null);
      try {
        await authService.requestPasswordReset(submittedEmail);
        setEmail(submittedEmail);
        setStep(2);
        AppAlert.alert(
          t('AUTH_FEEDBACK.CODE_SENT_TITLE'),
          t('AUTH_FEEDBACK.CODE_SENT_MESSAGE', { email: submittedEmail }),
          [{ text: t('AUTH_FEEDBACK.OK') }],
          { type: 'info', icon: 'mark-email-read' },
        );
      } catch (error) {
        showError(t('AUTH_FEEDBACK.ERROR_TITLE'), t(apiErrorKey(error)));
      } finally {
        setSubmitting(false);
      }
    },
    [authService, showError, t]
  );

  // pide un código nuevo: el anterior deja de servir
  const handleResendCode = useCallback(async () => {
    setErrorMessage(null);
    try {
      await authService.requestPasswordReset(email);
      AppAlert.alert(t('AUTH_FEEDBACK.CODE_RESENT_TITLE'), t('FORGOT.VERIFICATION.RESENT'), [{ text: t('AUTH_FEEDBACK.OK') }], {
        type: 'info',
        icon: 'mark-email-read',
      });
      return true;
    } catch (error) {
      showError(t('AUTH_FEEDBACK.ERROR_TITLE'), t(apiErrorKey(error)));
      return false;
    }
  }, [authService, email, showError, t]);

  // TOO_MANY_ATTEMPTS (423, SEC-12): el código quedó bloqueado por los intentos fallidos. Además del
  // mensaje se ofrece pedir otro, que vuelve al paso del código
  const showError423 = useCallback(
    (title: string, error: unknown): boolean => {
      if (apiErrorCode(error) !== 'TOO_MANY_ATTEMPTS') return false;
      const message = t(apiErrorKey(error));
      setErrorMessage(message);
      AppAlert.alert(
        title,
        message,
        [
          { text: t('AUTH_FEEDBACK.OK'), style: 'cancel' },
          {
            text: t('AUTH_FEEDBACK.REQUEST_NEW_CODE'),
            onPress: () => {
              setStep(2);
              void handleResendCode();
            },
          },
        ],
        { type: 'error' },
      );
      return true;
    },
    [handleResendCode, t],
  );

  const handleCodeVerified = useCallback(
    async (code: string) => {
      setSubmitting(true);
      setErrorMessage(null);
      try {
        await authService.verifyPasswordResetCode(email, code);
        setVerifiedCode(code);
        setStep(3);
        return true;
      } catch (error) {
        if (!showError423(t('AUTH_FEEDBACK.CODE_ERROR_TITLE'), error)) {
          showError(t('AUTH_FEEDBACK.CODE_ERROR_TITLE'), t(apiErrorKey(error)));
        }
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [authService, email, showError, showError423, t]
  );

  const handlePasswordUpdated = useCallback(
    async (newPassword: string) => {
      setSubmitting(true);
      setErrorMessage(null);
      try {
        await authService.resetPassword(email, verifiedCode, newPassword);
        return true;
      } catch (error) {
        // ej. SAME_PASSWORD: la nueva contraseña no puede ser la que ya tenía
        if (!showError423(t('AUTH_FEEDBACK.PASSWORD_ERROR_TITLE'), error)) {
          showError(t('AUTH_FEEDBACK.PASSWORD_ERROR_TITLE'), t(apiErrorKey(error)));
        }
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [authService, email, verifiedCode, showError, showError423, t]
  );

  return {
    step,
    email,
    submitting,
    errorMessage,
    handleEmailSent,
    handleCodeVerified,
    handleResendCode,
    handlePasswordUpdated,
  };
}
