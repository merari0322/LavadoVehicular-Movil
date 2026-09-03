import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';

export const SUPPORTED_LANGUAGES = ['es', 'en', 'pt', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = '@lavado_vehicular/lang';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    es: { translation: es },
    en: { translation: en },
    pt: { translation: pt },
    fr: { translation: fr },
  },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

// Restaura el idioma guardado en el dispositivo, igual que localStorage en la web.
export async function restoreSavedLanguage(): Promise<void> {
  try {
    const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang as SupportedLanguage)) {
      await i18n.changeLanguage(savedLang);
    }
  } catch {
    // si falla el storage, se conserva el idioma por defecto
  }
}

export async function setAppLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // persistencia best-effort
  }
}

export default i18n;
