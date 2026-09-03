import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthService } from '../../../core/services/auth';
import {
  getPasswordStrength,
  hasMinLength,
  isGmailEmail,
  isColombianPhone,
  isPasswordStrong,
  isRequired,
  sanitizeColombianPhoneInput,
  stripSpaces,
} from '../../../shared/validators/authValidators';

interface Touched {
  fullName?: boolean;
  email?: boolean;
  phone?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

export function useRegisterViewModel() {
  const authService = useAuthService();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState<Touched>({});
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const fullNameError = useMemo(() => {
    if (!touched.fullName) return undefined;
    if (!isRequired(fullName)) return t('REGISTER.NAME_REQUIRED');
    if (!hasMinLength(fullName, 3)) return t('REGISTER.NAME_MIN');
    return undefined;
  }, [fullName, touched.fullName, t]);

  const emailError = useMemo(() => {
    if (!touched.email) return undefined;
    if (!isRequired(email)) return t('REGISTER.EMAIL_REQUIRED');
    if (!isGmailEmail(email)) return t('REGISTER.EMAIL_INVALID');
    return undefined;
  }, [email, touched.email, t]);

  const phoneError = useMemo(() => {
    if (!touched.phone) return undefined;
    if (!isRequired(phone)) return t('REGISTER.PHONE_REQUIRED');
    if (!hasMinLength(phone, 10)) return t('REGISTER.PHONE_MIN');
    if (!isColombianPhone(phone)) return t('REGISTER.PHONE_INVALID');
    return undefined;
  }, [phone, touched.phone, t]);

  const passwordError = useMemo(() => {
    if (!touched.password) return undefined;
    if (!isRequired(password)) return t('REGISTER.PASSWORD_REQUIRED');
    return undefined;
  }, [password, touched.password, t]);

  const confirmPasswordError = useMemo(() => {
    if (!touched.confirmPassword) return undefined;
    if (!isRequired(confirmPassword)) return t('REGISTER.CONFIRM_REQUIRED');
    if (confirmPassword !== password) return t('REGISTER.PASSWORDS_NOT_MATCH');
    return undefined;
  }, [confirmPassword, password, touched.confirmPassword, t]);

  const isValid =
    isRequired(fullName) &&
    hasMinLength(fullName, 3) &&
    isGmailEmail(email) &&
    isColombianPhone(phone) &&
    isPasswordStrong(strength) &&
    confirmPassword === password &&
    isRequired(confirmPassword);

  const handleEmailChange = useCallback((value: string) => setEmail(stripSpaces(value)), []);
  const handlePhoneChange = useCallback((value: string) => setPhone(sanitizeColombianPhoneInput(value)), []);
  const markTouched = useCallback((field: keyof Touched) => setTouched((prev) => ({ ...prev, [field]: true })), []);

  const submit = useCallback(async (): Promise<boolean> => {
    setTouched({ fullName: true, email: true, phone: true, password: true, confirmPassword: true });

    if (!isValid) return false;

    setSubmitting(true);
    try {
      await authService.register({ fullName, email, phone, password });
      return true;
    } finally {
      setSubmitting(false);
    }
  }, [authService, fullName, email, phone, password, isValid]);

  return {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    strength,
    fullNameError,
    emailError,
    phoneError,
    passwordError,
    confirmPasswordError,
    submitting,
    isValid,
    setFullName,
    handleEmailChange,
    handlePhoneChange,
    setPassword,
    setConfirmPassword,
    markTouched,
    submit,
  };
}
