// Funciones de ayuda para montos, fechas y horarios de pagos
import { isoToDisplay } from './reservationUtils';

const pad = (value: number): string => String(value).padStart(2, '0');

// C-04: cuentas para registrar un pago en caja: las activas y la de efectivo aunque esté inactiva
// (desactivarla solo la quita a los clientes; payment-service la sigue aceptando para el admin)
export const manualPaymentAccounts = <T extends { active: boolean; methodCode: string }>(list: T[]): T[] =>
  list.filter((account) => account.active || account.methodCode === 'EFECTIVO');

// 85000 -> '85.000' (separador de miles colombiano)
export const formatThousands = (value: number): string =>
  String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// 85000 -> '$85.000'
export const formatCurrency = (value: number): string => `$${formatThousands(value)}`;

// 85000 -> '$85.000,00' (como aparece en el comprobante)
export const formatCurrencyExact = (value: number): string => `${formatCurrency(value)},00`;

// 85000 -> '$85.000 COP'
export const formatCOP = (value: number): string => `${formatCurrency(value)} COP`;

// ('2026-09-29', '14:48') -> '29/09/2026, 14:48'
export const formatDateTime = (date: string, time: string): string =>
  `${isoToDisplay(date)}, ${time}`;

// Convierte el texto del input en número (solo dígitos)
export const parseAmount = (text: string): number => Number(text.replace(/\D/g, '')) || 0;

// Máscara mientras se escribe el monto: 45000 -> 45.000
export const maskAmount = (text: string): string => {
  const value = parseAmount(text);
  return value > 0 ? formatThousands(value) : '';
};

// Hora actual en formato HH:mm
export const getCurrentTime = (): string => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Minutos entre dos horas HH:mm
export const minutesBetween = (start: string, end: string): number =>
  timeToMinutes(end) - timeToMinutes(start);

// 60 -> '1 hora', 90 -> '1 h 30 min', 45 -> '45 min'
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (rest > 0) return `${hours} h ${rest} min`;
  return hours === 1 ? '1 hora' : `${hours} horas`;
};
