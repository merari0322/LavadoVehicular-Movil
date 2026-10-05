import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { restoreSavedLanguage } from '../config/i18n';
import { AuthServiceProvider } from '../../core/services/auth';
import { ThemeProvider } from '../theme';
import { AccountPreferencesSync } from './AccountPreferencesSync';

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
          {children}
        </AuthServiceProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
