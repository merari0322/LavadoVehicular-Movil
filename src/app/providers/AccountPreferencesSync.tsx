import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES, SupportedLanguage, setAppLanguage } from '../config/i18n';
import { ThemeName, useTheme } from '../theme';
import { useSession } from '../../core/services/auth';
import { AccountPreferences, preferencesService } from '../../core/services/users/PreferencesService';

// temas del celular <-> códigos que guarda security-service (los mismos de la web)
const CODE_BY_THEME: Record<ThemeName, string> = {
  green: 'green-light',
  greenDark: 'green-dark',
  pink: 'pink',
  pinkDark: 'pink-dark',
};
const THEME_BY_CODE = Object.fromEntries(
  Object.entries(CODE_BY_THEME).map(([name, code]) => [code, name]),
) as Record<string, ThemeName>;

/**
 * Tema e idioma por cuenta (RF-019/020). Al iniciar sesión trae los de esa cuenta y los aplica;
 * cuando el usuario los cambia en Configuración, los guarda en su cuenta. No pinta nada.
 */
export function AccountPreferencesSync() {
  const { status, user } = useSession();
  const { themeName, setThemeName } = useTheme();
  const { i18n } = useTranslation();

  // lo último que se sabe de la cuenta: evita guardar lo que se acaba de cargar
  const synced = useRef<AccountPreferences | null>(null);

  // al entrar (o cambiar de cuenta) se aplican las preferencias guardadas en la cuenta
  useEffect(() => {
    synced.current = null;
    if (status !== 'signedIn') return;
    preferencesService
      .get()
      .then((prefs) => {
        synced.current = prefs;
        const theme = THEME_BY_CODE[prefs.theme];
        if (theme) setThemeName(theme);
        if ((SUPPORTED_LANGUAGES as readonly string[]).includes(prefs.language)) {
          void setAppLanguage(prefs.language as SupportedLanguage);
        }
      })
      .catch(() => undefined);
    // se recarga por cuenta, no en cada render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user?.id]);

  // si el usuario cambia tema o idioma, queda guardado en su cuenta
  useEffect(() => {
    const current = synced.current;
    if (status !== 'signedIn' || !current) return;
    const theme = CODE_BY_THEME[themeName];
    const language = i18n.language;
    if (theme === current.theme && language === current.language) return;
    const next = { ...current, theme, language };
    synced.current = next;
    preferencesService.save(next).catch(() => undefined);
  }, [themeName, i18n.language, status]);

  return null;
}
