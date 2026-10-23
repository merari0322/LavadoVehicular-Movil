// Funciones de ayuda del módulo de gestión

// Minúsculas y sin tildes, para que "bahia" encuentre "Bahía"
export const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida el formato de un correo
export const isValidEmail = (email: string): boolean => EMAIL_PATTERN.test(email);

// payment-service no acepta 100 %: el pago exige un monto mayor que cero (E-07)
export const MAX_DISCOUNT_PERCENT = 99;

// Descuento de un cupón: de 1 a 99 %
export const isValidDiscountPercent = (value: number): boolean => value >= 1 && value <= MAX_DISCOUNT_PERCENT;

// 31.2 -> '31.2%'
export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;
