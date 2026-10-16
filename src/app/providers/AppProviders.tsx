import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { restoreSavedLanguage } from '../config/i18n';
import { AuthServiceProvider } from '../../core/services/auth';
import { ThemeProvider } from '../theme';
import { AccountPreferencesSync } from './AccountPreferencesSync';
import { PushNotificationsSync } from './PushNotificationsSync';
import { AppUpdatesCheck } from './AppUpdatesCheck';
import { AppAlertHost } from '../../shared/components/feedback/AppAlert';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    restoreSavedLanguage().finally(() => setLanguageReady(true));
  }, []);

  if (!languageReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthServiceProvider>
          {/* tema e idioma por cuenta (security-service) */}
          <AccountPreferencesSync />
          {/* push del celular: registro, cierre de sesión y abrir la pantalla al tocarlas */}
          <PushNotificationsSync />
          {/* avisos de versión nueva: APK publicado en el servidor y actualización por internet */}
          <AppUpdatesCheck />
          {children}
          {/* alertas de la app (AppAlert.alert), encima de todas las pantallas */}
          <AppAlertHost />
        </AuthServiceProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
