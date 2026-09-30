import { useMemo } from 'react';
import { Reservation } from '../models/reservation';
import { getTodayISO } from '../utils/reservationUtils';

// Cuántas reservas activas tiene cada operario en un día (por defecto hoy): el modal
// "Asignar operario" lo muestra para repartir la carga de trabajo
export function useServicesByOperator(reservations: Reservation[], date?: string): Record<string, number> {
  return useMemo(() => {
    const day = date ?? getTodayISO();
    const counts: Record<string, number> = {};
    reservations
      .filter((item) => item.date === day && item.operatorId && item.status !== 'cancelled')
      .forEach((item) => {
        counts[item.operatorId] = (counts[item.operatorId] ?? 0) + 1;
      });
    return counts;
  }, [reservations, date]);
}
