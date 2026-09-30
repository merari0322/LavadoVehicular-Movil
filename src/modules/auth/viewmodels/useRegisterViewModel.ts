import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthService } from '../../../core/services/auth';
import { apiErrorKey } from '../../../core/api/apiError';
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
  documentNumber?: boolean;
  firstName?: boolean;
  lastName?: boolean;
  email?: boolean;
  phone?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

// cédula: solo dígitos, entre 5 y 20 (security.person.document_number)
const DOCUMENT_REGEX = /^[0-9]{5,20}$/;

export function useRegisterViewModel() {
  const authService = useAuthService();
  const { t } = useTranslation();

  const [documentNumber, setDocumentNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState<Touched>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const documentError = useMemo(() => {
    if (!touched.documentNumber) return undefined;
    if (!isRequired(documentNumber)) return t('REGISTER.DOCUMENT_REQUIRED');
    if (!DOCUMENT_REGEX.test(documentNumber)) return t('REGISTER.DOCUMENT_INVALID');
    return undefined;
  }, [documentNumber, touched.documentNumber, t]);

  const firstNameError = useMemo(() => {
    if (!touched.firstName) return undefined;
    if (!isRequired(firstName)) return t('REGISTER.NAME_REQUIRED');
    if (!hasMinLength(firstName.trim(), 3)) return t('REGISTER.NAME_MIN');
    return undefined;
  }, [firstName, touched.firstName, t]);

  const lastNameError = useMemo(() => {
    if (!touched.lastName) return undefined;
    if (!isRequired(lastName)) return t('REGISTER.LAST_NAMES_REQUIRED');
    if (!hasMinLength(lastName.trim(), 2)) return t('REGISTER.LAST_NAMES_MIN');
    return undefined;
  }, [lastName, touched.lastName, t]);

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
    DOCUMENT_REGEX.test(documentNumber) &&
    hasMinLength(firstName.trim(), 3) &&
    hasMinLength(lastName.trim(), 2) &&
    isGmailEmail(email) &&
    isColombianPhone(phone) &&
    isPasswordStrong(strength) &&
    confirmPassword === password &&
    isRequired(confirmPassword);

  // la cédula solo admite dígitos (quita puntos y espacios si la pegan)
  const handleDocumentChange = useCallback(
    (value: string) => setDocumentNumber(value.replace(/\D/g, '').substring(0, 20)),
    [],
  );
  const handleEmailChange = useCallback((value: string) => setEmail(stripSpaces(value)), []);
  const handlePhoneChange = useCallback((value: string) => setPhone(sanitizeColombianPhoneInput(value)), []);
  const markTouched = useCallback((field: keyof Touched) => setTouched((prev) => ({ ...prev, [field]: true })), []);

  const submit = useCallback(async (): Promise<boolean> => {
    setTouched({
      documentNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });
    setFormError(null);

    if (!isValid) return false;

    setSubmitting(true);
    try {
      await authService.register({
        documentNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        phone,
        password,
      });
      return true;
    } catch (error) {
      // correo o cédula ya registrados, contraseña débil, sin conexión...
      setFormError(t(apiErrorKey(error)));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [authService, documentNumber, firstName, lastName, email, phone, password, isValid, t]);

  return {
    documentNumber,
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    strength,
    documentError,
    firstNameError,
    lastNameError,
    emailError,
    phoneError,
    passwordError,
    confirmPasswordError,
    formError,
    submitting,
    isValid,
    handleDocumentChange,
    setFirstName,
    setLastName,
    handleEmailChange,
    handlePhoneChange,
    setPassword,
    setConfirmPassword,
    markTouched,
    submit,
  };
}
