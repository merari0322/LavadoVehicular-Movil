import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AuthError } from '../../../core/services/auth';
import { useAuthService } from '../../../core/services/auth';
import { isGmailEmail, isRequired, stripSpaces } from '../../../shared/validators/authValidators';

interface Touched {
  email?: boolean;
  password?: boolean;
}

// separa el estado/reglas del formulario (viewmodel) de la pantalla, que solo renderiza
export function useLoginViewModel() {
  const authService = useAuthService();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Touched>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailError = useMemo(() => {
    if (!touched.email) return undefined;
    if (!isRequired(email)) return t('LOGIN.EMAIL_REQUIRED');
    if (!isGmailEmail(email)) return t('LOGIN.EMAIL_INVALID');
    return undefined;
  }, [email, touched.email, t]);

  const passwordError = useMemo(() => {
    if (!touched.password) return undefined;
    if (!isRequired(password)) return t('LOGIN.PASSWORD_REQUIRED');
    return undefined;
  }, [password, touched.password, t]);

  const isValid = isRequired(email) && isGmailEmail(email) && isRequired(password);

  const handleEmailChange = useCallback((value: string) => setEmail(stripSpaces(value)), []);
  const markTouched = useCallback((field: keyof Touched) => setTouched((prev) => ({ ...prev, [field]: true })), []);

  const submit = useCallback(async (): Promise<{ success: boolean; userName?: string }> => {
    setTouched({ email: true, password: true });
    setFormError(null);

    if (!isValid) return { success: false };

    setSubmitting(true);
    try {
      const user = await authService.login({ email, password });
      return { success: true, userName: user.fullName };
    } catch (error) {
      if (error instanceof AuthError && error.code === 'INVALID_CREDENTIALS') {
        setFormError(t('LOGIN.INVALID_CREDENTIALS'));
      } else {
        setFormError(t('LOGIN.INVALID_CREDENTIALS'));
      }
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  }, [authService, email, password, isValid, t]);

  return {
    email,
    password,
    emailError,
    passwordError,
    formError,
    submitting,
    isValid,
    handleEmailChange,
    setPassword,
    markTouched,
    submit,
  };
}
