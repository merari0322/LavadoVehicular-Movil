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
}

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
  },
};
