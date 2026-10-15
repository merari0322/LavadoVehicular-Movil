import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { INITIAL_NOTIFICATION_PREFERENCES } from '../services/settingsMock';
import { PaymentAccount, SaveAccountRequest, paymentService } from '../../../core/services/payments/PaymentService';
import { bookingService } from '../../../core/services/booking/BookingService';
import { BusinessDataDto } from '../../../core/services/booking/booking.types';
import { refreshEstablishment } from '../../../shared/services/establishmentCatalog';
import { apiErrorKey } from '../../../core/api/apiError';
import { AccountPreferences, preferencesService } from '../../../core/services/users/PreferencesService';

// los datos del negocio se leen y se guardan en booking-service (GET/PUT /admin/establishment), que
// valida las reglas. Los interruptores de notificaciones se guardan en la cuenta (security-service)
// y notification-service los respeta.
const EMPTY_BUSINESS: BusinessData = {
  legalName: '', taxId: '', businessType: '', foundedAt: '', legalRepresentative: '', legalDocument: '',
  address: '', phone: '', email: '', website: '',
  taxRegime: '', ciiuActivity: '', dianResolution: '', invoicePrefix: '', invoiceRange: '',
  instagram: '', facebook: '', supportLine: '', schedule: '',
};

// vacío viaja como null para que la base no guarde textos en blanco
const orNull = (value: string): string | null => (value.trim() === '' ? null : value.trim());

const fromDto = (dto: BusinessDataDto): BusinessData => ({
  legalName: dto.legalName ?? '',
  taxId: dto.taxId ?? '',
  businessType: dto.businessType ?? '',
  foundedAt: dto.foundedOn ? isoToDisplay(dto.foundedOn) : '',
  legalRepresentative: dto.legalRepresentative ?? '',
  legalDocument: dto.legalRepresentativeDocument ?? '',
  address: dto.address ?? '',
  phone: dto.phone ?? '',
  email: dto.email ?? '',
  website: dto.website ?? '',
  taxRegime: dto.taxRegime ?? '',
  ciiuActivity: dto.ciiuActivity ?? '',
  dianResolution: dto.dianResolution ?? '',
  invoicePrefix: dto.invoicePrefix ?? '',
  invoiceRange: dto.invoiceRange ?? '',
  instagram: dto.instagram ?? '',
  facebook: dto.facebook ?? '',
  supportLine: dto.supportLine ?? '',
  schedule: dto.serviceHoursNote ?? '',
});

const toDto = (data: BusinessData): BusinessDataDto => ({
  tradeName: null, // el nombre comercial no se edita aquí: el backend conserva el actual
  legalName: data.legalName.trim(),
  taxId: data.taxId.trim(),
  businessType: orNull(data.businessType),
  foundedOn: data.foundedAt.trim() ? displayToISO(data.foundedAt.trim()) : null,
  legalRepresentative: orNull(data.legalRepresentative),
  legalRepresentativeDocument: orNull(data.legalDocument),
  address: data.address.trim(),
  phone: orNull(data.phone),
  email: orNull(data.email),
  website: orNull(data.website),
  taxRegime: orNull(data.taxRegime),
  ciiuActivity: orNull(data.ciiuActivity),
  dianResolution: orNull(data.dianResolution),
  invoicePrefix: orNull(data.invoicePrefix),
  invoiceRange: orNull(data.invoiceRange),
  instagram: orNull(data.instagram),
  facebook: orNull(data.facebook),
  supportLine: orNull(data.supportLine),
  serviceHoursNote: orNull(data.schedule),
});

// resultado de guardar: invalid = errores del formulario; error = llave de traducción del backend
export type SaveBusinessResult = { status: 'saved' } | { status: 'invalid' } | { status: 'error'; errorKey: string };

const toPreferences = (prefs: AccountPreferences): NotificationPreferences => ({
  push: prefs.notificationsEnabled,
  emailReminders: prefs.emailRemindersEnabled,
  promotions: prefs.promotionsEnabled,
});

// cuenta de payment-service -> medio de pago de la pantalla
function toMethod(a: PaymentAccount): PaymentMethod {
  return {
    id: String(a.id),
    name: a.methodName,
    type: a.methodCode === 'TRANSFERENCIA' ? 'bank' : a.methodCode === 'EFECTIVO' ? 'other' : 'wallet',
    holder: a.accountHolder,
    account: a.accountNumber ?? '',
    requiresQr: a.requiresReceipt,
    qrFileName: a.qrImageUrl ? 'QR' : '',
    active: a.active,
    qrImage: a.qrImageUrl,
  };
}

// el formulario pide un nombre libre; se traduce al medio del catálogo de payment-service
function methodCodeFor(name: string, type: string): string {
  const text = `${name} ${type}`.toLowerCase();
  if (text.includes('nequi')) return 'NEQUI';
  if (text.includes('davi')) return 'DAVIPLATA';
  if (text.includes('efectivo') || text.includes('cash') || type === 'other') return 'EFECTIVO';
  return 'TRANSFERENCIA';
}
import { displayToISO, isoToDisplay } from '../utils/reservationUtils';
import { countDigits, isValidEmail } from '../utils/settingsUtils';
import { AppAlert } from '../../../shared/components/feedback/AppAlert';

// Resultado de validar los datos del negocio: un mensaje de error por campo
export type BusinessErrors = Partial<Record<keyof BusinessData, string>>;

// Campos que no pueden quedar vacíos
const REQUIRED_FIELDS: (keyof BusinessData)[] = ['legalName', 'taxId', 'address', 'phone'];

// Valida obligatorios, teléfonos, correo y fecha de constitución
const validateBusiness = (data: BusinessData): BusinessErrors => {
  const messages = SETTINGS_TEXTS.business.errors;
  const errors: BusinessErrors = {};

  REQUIRED_FIELDS.forEach((field) => {
    if (data[field].trim() === '') errors[field] = messages.required;
  });

  if (data.phone.trim() && countDigits(data.phone) < 7) errors.phone = messages.phone;
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
  const { t, i18n } = useTranslation();
  const theme = ID_BY_THEME[themeName];
  const setTheme = (id: ThemeId) => setThemeName(THEME_BY_ID[id]);
  const language = i18n.language as AppLanguage;
  const setLanguage = (code: AppLanguage) => void setAppLanguage(code);

  // interruptores de la cuenta; sin respuesta se quedan los valores por defecto (todos activos)
  useEffect(() => {
    preferencesService
      .get()
      .then((prefs) => setPreferences(toPreferences(prefs)))
      .catch(() => undefined);
  }, []);

  // Datos del negocio: lo guardado en booking-service y el borrador que se está editando.
  // businessLoaded queda en false hasta que responde: así no se guarda un formulario vacío.
  const [savedBusiness, setSavedBusiness] = useState<BusinessData>(EMPTY_BUSINESS);
  const [draftBusiness, setDraftBusiness] = useState<BusinessData>(EMPTY_BUSINESS);
  const [businessLoaded, setBusinessLoaded] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [showAllErrors, setShowAllErrors] = useState(false);

  const loadBusiness = useCallback(async () => {
    const business = fromDto(await bookingService.businessData());
    setSavedBusiness(business);
    setDraftBusiness(business);
    setBusinessLoaded(true);
  }, []);

  useEffect(() => {
    loadBusiness().catch(() => undefined);
  }, [loadBusiness]);

  // Métodos de pago: cuentas reales del lavadero (payment-service)
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);

  const reloadPayments = useCallback(async () => {
    const list = await paymentService.adminAccounts();
    setAccounts(list);
    setPayments(list.map(toMethod));
  }, []);

  useEffect(() => {
    reloadPayments().catch(() => undefined);
  }, [reloadPayments]);

  // guarda una cuenta con los cambios indicados y recarga
  const saveAccount = async (id: string, changes: Partial<SaveAccountRequest>) => {
    const current = accounts.find((a) => String(a.id) === id);
    if (!current) return;
    await paymentService.updateAccount(Number(id), {
      methodCode: current.methodCode,
      accountHolder: current.accountHolder,
      accountNumber: current.accountNumber,
      qrImageUrl: current.qrImageUrl,
      instructions: current.instructions,
      active: current.active,
      ...changes,
    });
    await reloadPayments();
  };

  // ---------------------------------------------------------------
  // General
  // ---------------------------------------------------------------

  // Enciende o apaga una preferencia de notificaciones y la guarda en la cuenta; si no se guarda,
  // vuelve como estaba y avisa
  const togglePreference = (key: NotificationPreferenceKey) => {
    const previous = preferences;
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    preferencesService
      .saveNotificationChannels({ push: next.push, email: next.emailReminders, promo: next.promotions })
      .then((saved) => setPreferences(toPreferences(saved)))
      .catch(() => {
        setPreferences(previous);
        AppAlert.alert(t('COMMON.ERROR'), t('CONFIG.NOTIFICATIONS_SAVE_ERROR'), undefined, { type: 'error' });
      });
  };

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

  // Guarda en booking-service. Primero revisa el formulario (para marcar los campos en rojo); las
  // reglas las vuelve a validar el backend y, si las rechaza, se devuelve su mensaje.
  const saveBusiness = async (): Promise<SaveBusinessResult> => {
    if (!businessLoaded || Object.keys(validateBusiness(draftBusiness)).length > 0) {
      setShowAllErrors(true);
      return { status: 'invalid' };
    }
    setSavingBusiness(true);
    try {
      const saved = fromDto(await bookingService.saveBusinessData(toDto(draftBusiness)));
      setSavedBusiness(saved);
      setDraftBusiness(saved);
      setShowAllErrors(false);
      void refreshEstablishment();
      return { status: 'saved' };
    } catch (error) {
      return { status: 'error', errorKey: apiErrorKey(error) };
    } finally {
      setSavingBusiness(false);
    }
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
    paymentService
      .createAccount({
        methodCode: methodCodeFor(values.name, values.type),
        // el titular es obligatorio en payment-service; si no lo escriben, va el nombre del medio
        accountHolder: values.holder || values.name,
        accountNumber: values.account || null,
        qrImageUrl: null,
        instructions: null,
        active: true,
      })
      .then(reloadPayments)
      .catch(() => undefined);

  const updatePaymentMethod = (id: string, values: PaymentMethodFormValues) =>
    saveAccount(id, {
      methodCode: methodCodeFor(values.name, values.type),
      accountHolder: values.holder || values.name,
      accountNumber: values.account || null,
    }).catch(() => undefined);

  const togglePaymentActive = (id: string) => {
    const current = accounts.find((a) => String(a.id) === id);
    if (current) saveAccount(id, { active: !current.active }).catch(() => undefined);
  };

  // las cuentas no se borran (hay pagos que las usan): se desactivan
  const deletePaymentMethod = (id: string) => saveAccount(id, { active: false }).catch(() => undefined);

  // Elige una imagen y la guarda como QR del método
  const replaceQr = async (id: string): Promise<QrPickResult> => {
    try {
      const picked = await pickQrImage();
      if (!picked) return 'cancelled';

      // el QR queda guardado en payment-service: es el que ve y escanea el cliente
      await saveAccount(id, { qrImageUrl: picked.dataUrl });
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
    businessLoaded,
    savingBusiness,
    reloadBusiness: loadBusiness,
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
