// Funciones de ayuda del módulo de gestión
import { isAllowedEmail } from '../../../shared/validators/authValidators';

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

// Correo de una cuenta nueva: formato y dominio permitido (A-01, igual que security-service)
export const isValidAccountEmail = (email: string): boolean => isAllowedEmail(email);

// 31.2 -> '31.2%'
export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;
