import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '../../../core/services/auth';
import { apiErrorCode, apiErrorKey } from '../../../core/api/apiError';
import { isAllowedEmail, isRequired, stripSpaces } from '../../../shared/validators/authValidators';

export interface LoginResult {
  success: boolean;
  userName?: string;
  // solo si el backend rechazó el inicio de sesión
  errorCode?: string | null;
  message?: string;
}

interface Touched {
  email?: boolean;
  password?: boolean;
}

// separa el estado/reglas del formulario (viewmodel) de la pantalla, que solo renderiza
export function useLoginViewModel() {
  const session = useSession();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Touched>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailError = useMemo(() => {
    if (!touched.email) return undefined;
    if (!isRequired(email)) return t('LOGIN.EMAIL_REQUIRED');
    if (!isAllowedEmail(email)) return t('LOGIN.EMAIL_INVALID');
    return undefined;
  }, [email, touched.email, t]);

  const passwordError = useMemo(() => {
    if (!touched.password) return undefined;
    if (!isRequired(password)) return t('LOGIN.PASSWORD_REQUIRED');
    return undefined;
  }, [password, touched.password, t]);

  const isValid = isRequired(email) && isAllowedEmail(email) && isRequired(password);

  const handleEmailChange = useCallback((value: string) => setEmail(stripSpaces(value)), []);
  const markTouched = useCallback((field: keyof Touched) => setTouched((prev) => ({ ...prev, [field]: true })), []);

  // si inicia sesión bien, la navegación cambia sola al área de su rol (RootNavigator)
  // devuelve el resultado para que la pantalla muestre el modal de éxito, error o bloqueo
  const submit = useCallback(async (): Promise<LoginResult> => {
    setTouched({ email: true, password: true });
    setFormError(null);

    if (!isValid) return { success: false };

    setSubmitting(true);
    try {
      const user = await session.signIn({ email, password });
      return { success: true, userName: user.fullName };
    } catch (error) {
      // mensaje exacto del backend: credenciales, cuenta desactivada, sin conexión...
      const message = t(apiErrorKey(error));
      setFormError(message);
      return { success: false, errorCode: apiErrorCode(error), message };
    } finally {
      setSubmitting(false);
    }
  }, [session, email, password, isValid, t]);

  return {
    sessionExpired: session.expired,
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
