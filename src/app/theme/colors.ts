export type ThemeName = 'green' | 'greenDark' | 'pink' | 'pinkDark';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primarySoft: string;
  bg: string;
  bgSoft: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  itemHover: string;
  overlayDark: string;
  overlayLight: string;
  onPrimary: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
}

const statusColors = {
  success: '#22c55e',
  successSoft: 'rgba(34, 197, 94, 0.15)',
  warning: '#f59e0b',
  warningSoft: 'rgba(245, 158, 11, 0.15)',
  error: '#ef4444',
  errorSoft: 'rgba(239, 68, 68, 0.15)',
};

// valores tomados 1:1 de las variables CSS en styles.scss del proyecto web
export const themes: Record<ThemeName, ThemeColors> = {
  green: {
    primary: '#2ec4b6',
    primaryHover: '#229990',
    primarySoft: 'rgba(46, 196, 182, 0.15)',
    bg: '#f5f6f8',
    bgSoft: '#F9FBFB',
    card: '#ffffff',
    text: '#1a1a2e',
    textSecondary: '#5f6f75',
    textMuted: '#9aa5ab',
    border: '#e6eaea',
    itemHover: 'rgba(0, 0, 0, 0.07)',
    overlayDark: 'rgba(19, 28, 32, 0.80)',
    overlayLight: 'rgba(0, 0, 0, 0.55)',
    onPrimary: '#ffffff',
    ...statusColors,
  },
  greenDark: {
    primary: '#2ec4b6',
    primaryHover: '#1fa89c',
    primarySoft: 'rgba(46, 196, 182, 0.2)',
    bg: '#1a1a1a',
    bgSoft: '#131C20',
    card: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#c2c2c2',
    textMuted: '#8a8a8a',
    border: '#2f2f2f',
    itemHover: 'rgba(255, 255, 255, 0.08)',
    overlayDark: 'rgba(0, 0, 0, 0.85)',
    overlayLight: 'rgba(0, 0, 0, 0.65)',
    onPrimary: '#ffffff',
    ...statusColors,
  },
  pink: {
    primary: '#ff4fa3',
    primaryHover: '#e13b8c',
    primarySoft: 'rgba(255, 79, 163, 0.15)',
    bg: '#f5f6f8',
    bgSoft: '#ffe4ef',
    card: '#ffffff',
    text: '#1a1a2e',
    textSecondary: '#5f6f75',
    textMuted: '#9aa5ab',
    border: '#e6eaea',
    itemHover: 'rgba(0, 0, 0, 0.07)',
    overlayDark: 'rgba(255, 0, 120, 0.45)',
    overlayLight: 'rgba(0, 0, 0, 0.45)',
    onPrimary: '#ffffff',
    ...statusColors,
  },
  pinkDark: {
    primary: '#ff4fa3',
    primaryHover: '#e13b8c',
    primarySoft: 'rgba(255, 79, 163, 0.2)',
    bg: '#1a1a1a',
    bgSoft: '#1f0f18',
    card: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#c2c2c2',
    textMuted: '#8a8a8a',
    border: '#2f2f2f',
    itemHover: 'rgba(255, 255, 255, 0.08)',
    overlayDark: 'rgba(0, 0, 0, 0.85)',
    overlayLight: 'rgba(255, 0, 120, 0.35)',
    onPrimary: '#ffffff',
    ...statusColors,
  },
};
