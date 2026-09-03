import { useCallback, useState } from 'react';

import { useAuthService } from '../../../core/services/auth';
import { ForgotPasswordStep } from '../types/auth.types';

// mismo rol que ForgotPasswordComponent en la web: solo orquesta la transición
// entre pasos: cada paso valida y recolecta su propio input.
export function useForgotPasswordFlow() {
  const authService = useAuthService();

  const [step, setStep] = useState<ForgotPasswordStep>(1);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSent = useCallback(
    async (submittedEmail: string) => {
      setSubmitting(true);
      try {
        await authService.requestPasswordReset(submittedEmail);
        setEmail(submittedEmail);
        setStep(2);
      } finally {
        setSubmitting(false);
      }
    },
    [authService]
  );

  const handleCodeVerified = useCallback(
    async (code: string) => {
      setSubmitting(true);
      try {
        await authService.verifyPasswordResetCode(email, code);
        setStep(3);
        return true;
      } catch {
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [authService, email]
  );

  const handlePasswordUpdated = useCallback(
    async (newPassword: string) => {
      setSubmitting(true);
      try {
        await authService.resetPassword(email, newPassword);
        return true;
      } finally {
        setSubmitting(false);
      }
    },
    [authService, email]
  );

  return { step, email, submitting, handleEmailSent, handleCodeVerified, handlePasswordUpdated };
}
