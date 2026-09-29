// Utilidades de fechas para notificaciones

// Devuelve solo la fecha (YYYY-MM-DD) de un valor ISO con hora
export const getDatePart = (iso: string): string => iso.slice(0, 10);

// Convierte 2026-09-19T08:40 en 19/09/2026 - 08:40
export const formatDateTime = (iso: string): string => {
  const [date, time = ''] = iso.split('T');
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} - ${time.slice(0, 5)}`;
};
