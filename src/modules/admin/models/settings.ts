// Modelos y tipos del módulo de configuración

export type SettingsTab = 'general' | 'business' | 'payments';
export const SETTINGS_TABS: SettingsTab[] = ['general', 'business', 'payments'];

// ---------------------------------------------------------------
// General: notificaciones, ayuda y apariencia
// ---------------------------------------------------------------

export type NotificationPreferenceKey = 'push' | 'emailReminders' | 'promotions';
export const NOTIFICATION_PREFERENCE_KEYS: NotificationPreferenceKey[] = [
  'push',
  'emailReminders',
  'promotions',
];
export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export type HelpTopic = 'helpCenter' | 'terms' | 'privacy';
export const HELP_TOPICS: HelpTopic[] = ['helpCenter', 'terms', 'privacy'];

export type ThemeId = 'teal-light' | 'teal-dark' | 'pink-light' | 'pink-dark';

// Colores solo de la miniatura de vista previa (no son los colores reales del tema)
export interface ThemeOption {
  id: ThemeId;
  accent: string;
  surface: string;
  line: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'teal-light', accent: '#2EC4B6', surface: '#F4F4F4', line: '#DADADA' },
  { id: 'teal-dark', accent: '#2EC4B6', surface: '#3A3A3A', line: '#5A5A5A' },
  { id: 'pink-light', accent: '#FF4FA3', surface: '#F4F4F4', line: '#DADADA' },
  { id: 'pink-dark', accent: '#FF4FA3', surface: '#3A3A3A', line: '#5A5A5A' },
];

export type AppLanguage = 'es' | 'en' | 'fr' | 'pt';

export interface LanguageOption {
  code: AppLanguage;
  name: string; // Nombre del idioma en su propio idioma
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

// ---------------------------------------------------------------
// Datos del negocio
// ---------------------------------------------------------------

export interface BusinessData {
  // Información general
  legalName: string;
  taxId: string;
  businessType: string;
  foundedAt: string; // Formato dd/mm/aaaa (tal como se escribe en el campo)
  legalRepresentative: string;
  legalDocument: string;
  // Ubicación y contacto
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  // Información fiscal
  taxRegime: string;
  ciiuActivity: string;
  dianResolution: string;
  invoicePrefix: string;
  invoiceRange: string;
  // Canales oficiales
  instagram: string;
  facebook: string;
  supportLine: string;
  schedule: string;
}

// ---------------------------------------------------------------
// Métodos de pago
// ---------------------------------------------------------------

export type PaymentType = 'wallet' | 'bank' | 'other';
export const PAYMENT_TYPES: PaymentType[] = ['wallet', 'bank', 'other'];

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentType;
  holder: string;
  account: string; // Número de celular o de cuenta
  requiresQr: boolean;
  qrFileName: string; // '' = aún no tiene QR cargado
  active: boolean;
}

export type PaymentMethodFormValues = Pick<
  PaymentMethod,
  'name' | 'type' | 'holder' | 'account' | 'requiresQr'
>;

// Resultado de elegir un archivo QR
export type QrPickResult = 'updated' | 'cancelled' | 'error';
