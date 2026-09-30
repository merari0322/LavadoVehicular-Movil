import { TEXTS } from '../constants/reservationTexts';

// Funciones de ayuda para fechas, horas y textos de reservas

const pad = (value: number): string => String(value).padStart(2, '0');

// Convierte un Date a formato ISO (YYYY-MM-DD)
export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Fecha de hoy en formato ISO
export const getTodayISO = (): string => toISODate(new Date());

// Fecha ISO de hoy más (o menos) N días
export const addDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

// ISO (2026-09-28) -> visual (28/09/2026)
export const isoToDisplay = (iso: string): string => {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
};

// Visual (28/09/2026) -> ISO (2026-09-28). Devuelve null si la fecha no es válida
export const displayToISO = (display: string): string | null => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isValid =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);

  return isValid ? `${year}-${month}-${day}` : null;
};

// Máscara mientras se escribe la fecha: 28092026 -> 28/09/2026
export const maskDate = (text: string): string => {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

// Máscara mientras se escribe la hora: 0930 -> 09:30
export const maskTime = (text: string): string => {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
};

// Valida una hora en formato 24h (HH:mm)
export const isValidTime = (time: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

// Suma minutos a una hora: ('09:00', 60) -> '10:00'
export const addMinutes = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
};

// Muestra "Hoy" si la fecha es la de hoy, si no dd/mm/aaaa
export const formatDateLabel = (iso: string): string =>
  iso === getTodayISO() ? TEXTS.filters.today : isoToDisplay(iso);

// Iniciales de un nombre: 'Carlos Ruiz' -> 'CR'
export const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
