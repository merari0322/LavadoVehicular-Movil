import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ThemeColors, ThemeName, themes } from './colors';

interface ThemeContextValue {
  themeName: ThemeName;
  colors: ThemeColors;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// el tema elegido se guarda en el celular, igual que 'theme' en el localStorage de la web
const THEME_STORAGE_KEY = '@lavado_vehicular/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeName;
}

export function ThemeProvider({ children, initialTheme = 'green' }: ThemeProviderProps) {
  const [themeName, setThemeNameState] = useState<ThemeName>(initialTheme);

  // al abrir la app recupera el tema guardado
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved && saved in themes) setThemeNameState(saved as ThemeName);
      })
      .catch(() => undefined);
  }, []);

  const setThemeName = useCallback((name: ThemeName) => {
    setThemeNameState(name);
    // si no se puede guardar, el tema queda solo mientras la app esté abierta
    AsyncStorage.setItem(THEME_STORAGE_KEY, name).catch(() => undefined);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeName, colors: themes[themeName], setThemeName }),
    [themeName, setThemeName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
}
