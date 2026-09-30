import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '../../../app/config/i18n';
import { ThemeName, useTheme } from '../../../app/theme';
import { SETTINGS_TEXTS } from '../constants/settingsTexts';
import {
  AppLanguage,
  BusinessData,
  NotificationPreferenceKey,
  NotificationPreferences,
  PaymentMethod,
  PaymentMethodFormValues,
  QrPickResult,
  SettingsTab,
  ThemeId,
} from '../models/settings';
import { pickQrImage } from '../services/qrPicker';
import {
  INITIAL_BUSINESS,
  INITIAL_NOTIFICATION_PREFERENCES,
  INITIAL_PAYMENT_METHODS,
} from '../services/settingsMock';
import { displayToISO } from '../utils/reservationUtils';
import { countDigits, isValidEmail } from '../utils/settingsUtils';

// Resultado de validar los datos del negocio: un mensaje de error por campo
export type BusinessErrors = Partial<Record<keyof BusinessData, string>>;

// Campos que no pueden quedar vacíos
const REQUIRED_FIELDS: (keyof BusinessData)[] = ['legalName', 'taxId', 'address', 'phone'];

// Genera un id único para los registros nuevos
const newId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Valida obligatorios, teléfonos, correo y fecha de constitución
const validateBusiness = (data: BusinessData): BusinessErrors => {
  const messages = SETTINGS_TEXTS.business.errors;
  const errors: BusinessErrors = {};

  REQUIRED_FIELDS.forEach((field) => {
    if (data[field].trim() === '') errors[field] = messages.required;
  });

  if (data.phone.trim() && countDigits(data.phone) < 7) errors.phone = messages.phone;
  if (data.whatsapp.trim() && countDigits(data.whatsapp) < 7) errors.whatsapp = messages.phone;
  if (data.email.trim() && !isValidEmail(data.email)) errors.email = messages.email;
  if (data.foundedAt.trim() && !displayToISO(data.foundedAt)) errors.foundedAt = messages.date;

  return errors;
};

// ids de las miniaturas de tema <-> temas reales del ThemeProvider
const THEME_BY_ID: Record<ThemeId, ThemeName> = {
  'teal-light': 'green',
  'teal-dark': 'greenDark',
  'pink-light': 'pink',
  'pink-dark': 'pinkDark',
};
const ID_BY_THEME = Object.fromEntries(
  Object.entries(THEME_BY_ID).map(([id, name]) => [name, id]),
) as Record<ThemeName, ThemeId>;

// Hook con el estado y la lógica de la pantalla de configuración
export function useSettings() {
  const [tab, setTab] = useState<SettingsTab>('general');

  // General
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    INITIAL_NOTIFICATION_PREFERENCES,
  );
  // tema e idioma reales: se aplican a toda la app y quedan guardados en el celular
  const { themeName, setThemeName } = useTheme();
  const { i18n } = useTranslation();
  const theme = ID_BY_THEME[themeName];
  const setTheme = (id: ThemeId) => setThemeName(THEME_BY_ID[id]);
  const language = i18n.language as AppLanguage;
  const setLanguage = (code: AppLanguage) => void setAppLanguage(code);

  // Datos del negocio: guardado y borrador que se está editando
  const [savedBusiness, setSavedBusiness] = useState<BusinessData>(INITIAL_BUSINESS);
  const [draftBusiness, setDraftBusiness] = useState<BusinessData>(INITIAL_BUSINESS);
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Métodos de pago
  const [payments, setPayments] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);

  // ---------------------------------------------------------------
  // General
  // ---------------------------------------------------------------

  // Enciende o apaga una preferencia de notificaciones
  const togglePreference = (key: NotificationPreferenceKey) =>
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));

  // ---------------------------------------------------------------
  // Datos del negocio
  // ---------------------------------------------------------------

  const isDirty = useMemo(
    () => JSON.stringify(savedBusiness) !== JSON.stringify(draftBusiness),
    [savedBusiness, draftBusiness],
  );

  // Antes del primer intento de guardado solo se muestran errores de campos con contenido
  const businessErrors = useMemo<BusinessErrors>(() => {
    const all = validateBusiness(draftBusiness);
    if (showAllErrors) return all;

    const visible: BusinessErrors = {};
    (Object.keys(all) as (keyof BusinessData)[]).forEach((key) => {
      if (draftBusiness[key].trim() !== '') visible[key] = all[key];
    });
    return visible;
  }, [draftBusiness, showAllErrors]);

  // Cambia solo los campos indicados
  const updateBusiness = (partial: Partial<BusinessData>) =>
    setDraftBusiness((prev) => ({ ...prev, ...partial }));

  // Descarta los cambios y vuelve a los últimos datos guardados
  const discardBusiness = () => {
    setDraftBusiness(savedBusiness);
    setShowAllErrors(false);
  };

  // Guarda los datos (devuelve false si hay errores)
  const saveBusiness = (): boolean => {
    if (Object.keys(validateBusiness(draftBusiness)).length > 0) {
      setShowAllErrors(true);
      return false;
    }

    setSavedBusiness(draftBusiness);
    setShowAllErrors(false);
    return true;
  };

  // ---------------------------------------------------------------
  // Métodos de pago
  // ---------------------------------------------------------------

  const activePayments = useMemo(
    () => payments.filter((method) => method.active).length,
    [payments],
  );

  // Indica si ya existe un método con ese nombre (se ignora el que se edita)
  const isPaymentNameTaken = (name: string, ignoreId?: string): boolean =>
    payments.some(
      (method) =>
        method.id !== ignoreId && method.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );

  const createPaymentMethod = (values: PaymentMethodFormValues) =>
    setPayments((prev) => [...prev, { id: newId('pay'), active: true, qrFileName: '', ...values }]);

  // Si el método deja de requerir QR, se descarta el archivo cargado
  const updatePaymentMethod = (id: string, values: PaymentMethodFormValues) =>
    setPayments((prev) =>
      prev.map((method) =>
        method.id === id
          ? { ...method, ...values, qrFileName: values.requiresQr ? method.qrFileName : '' }
          : method,
      ),
    );

  const togglePaymentActive = (id: string) =>
    setPayments((prev) =>
      prev.map((method) => (method.id === id ? { ...method, active: !method.active } : method)),
    );

  const deletePaymentMethod = (id: string) =>
    setPayments((prev) => prev.filter((method) => method.id !== id));

  // Elige una imagen y la guarda como QR del método
  const replaceQr = async (id: string): Promise<QrPickResult> => {
    try {
      const fileName = await pickQrImage();
      if (!fileName) return 'cancelled';

      setPayments((prev) =>
        prev.map((method) => (method.id === id ? { ...method, qrFileName: fileName } : method)),
      );
      return 'updated';
    } catch {
      return 'error';
    }
  };

  return {
    tab,
    setTab,
    // General
    preferences,
    togglePreference,
    theme,
    setTheme,
    language,
    setLanguage,
    // Datos del negocio
    businessName: savedBusiness.legalName,
    business: draftBusiness,
    businessErrors,
    isDirty,
    updateBusiness,
    discardBusiness,
    saveBusiness,
    // Métodos de pago
    payments,
    activePayments,
    isPaymentNameTaken,
    createPaymentMethod,
    updatePaymentMethod,
    togglePaymentActive,
    deletePaymentMethod,
    replaceQr,
  };
}
