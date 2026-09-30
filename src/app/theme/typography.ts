import { TextStyle } from 'react-native';

// tamaños y pesos de letra tomados de la web (1rem = 16px), para que todas las pantallas
// usen la misma escala en lugar de números sueltos en cada archivo
export const fontSize = {
  pageTitle: 24, // h1 de cada página (web: clamp(1.5rem, 2vw, 1.75rem))
  cardTitle: 17, // h2 de las tarjetas (web: 1.05rem)
  statValue: 26, // número grande de las tarjetas de estadísticas (web: 1.75rem)
  body: 14,
  small: 13, // textos secundarios (web: 0.85rem)
  caption: 12,
  tiny: 11,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const satisfies Record<string, TextStyle['fontWeight']>;

// espacios y bordes que se repiten en las tarjetas de la web
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 10, md: 12, lg: 16, xl: 22, pill: 999 } as const;
