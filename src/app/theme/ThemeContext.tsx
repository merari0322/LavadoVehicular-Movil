import React, { createContext, useContext, useMemo, useState } from 'react';

import { ThemeColors, ThemeName, themes } from './colors';

interface ThemeContextValue {
  themeName: ThemeName;
  colors: ThemeColors;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeName;
}

export function ThemeProvider({ children, initialTheme = 'green' }: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeName, colors: themes[themeName], setThemeName }),
    [themeName]
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
