import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthService } from '../../../core/services/auth';
import { apiErrorKey } from '../../../core/api/apiError';
import { ForgotPasswordStep } from '../types/auth.types';

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

  // el servidor responde igual exista o no la cuenta (no revela correos registrados)
  const handleEmailSent = useCallback(
    async (submittedEmail: string) => {
      setSubmitting(true);
      setErrorMessage(null);
      try {
        await authService.requestPasswordReset(submittedEmail);
        setEmail(submittedEmail);
        setStep(2);
      } catch (error) {
        setErrorMessage(t(apiErrorKey(error)));
      } finally {
        setSubmitting(false);
      }
    },
    [authService, t]
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
        setErrorMessage(t(apiErrorKey(error)));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [authService, email, t]
  );

  // pide un código nuevo: el anterior deja de servir
  const handleResendCode = useCallback(async () => {
    setErrorMessage(null);
    try {
      await authService.requestPasswordReset(email);
      return true;
    } catch (error) {
      setErrorMessage(t(apiErrorKey(error)));
      return false;
    }
  }, [authService, email, t]);

  const handlePasswordUpdated = useCallback(
    async (newPassword: string) => {
      setSubmitting(true);
      setErrorMessage(null);
      try {
        await authService.resetPassword(email, verifiedCode, newPassword);
        return true;
      } catch (error) {
        setErrorMessage(t(apiErrorKey(error)));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [authService, email, verifiedCode, t]
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
