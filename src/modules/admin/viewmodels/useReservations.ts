import { useMemo, useRef, useState } from 'react';
import {
  Reservation,
  ReservationFilters,
  ReservationFormValues,
  ReservationStatsData,
} from '../models/reservation';
import { buildMockReservations } from '../services/reservationMock';
import { displayToISO, getTodayISO } from '../utils/reservationUtils';

// Filtros sin ningún valor aplicado
export const EMPTY_FILTERS: ReservationFilters = {
  search: '',
  date: '',
  status: '',
  operatorId: '',
};

// Deja solo letras y números en minúscula (así "wqx115" encuentra "WQX-115")
const normalize = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]/g, '');

// Hook con el estado y la lógica de la pantalla de reservas
export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>(() => buildMockReservations());
  const [filters, setFilters] = useState<ReservationFilters>(EMPTY_FILTERS);
  const nextNumber = useRef(8920); // Consecutivo para los códigos nuevos

  // Reservas que cumplen los filtros, ordenadas por fecha y hora
  const filteredReservations = useMemo(() => {
    const query = normalize(filters.search);
    const dateISO = displayToISO(filters.date);

    return reservations
      .filter((item) => {
        // Búsqueda por cliente, placa, código o teléfono
        if (query) {
          const haystack = normalize(
            [item.customerName, item.plate, item.code, item.phone].join(' '),
          );
          if (!haystack.includes(query)) return false;
        }

        // Fecha (solo se aplica si el texto es una fecha completa y válida)
        if (dateISO && item.date !== dateISO) return false;

        // Estado
        if (filters.status && item.status !== filters.status) return false;

        // Operario
        if (filters.operatorId === 'unassigned') return !item.operatorId;
        if (filters.operatorId && item.operatorId !== filters.operatorId) return false;

        return true;
      })
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [reservations, filters]);

  // Estadísticas de las reservas de hoy
  const stats = useMemo<ReservationStatsData>(() => {
    const todays = reservations.filter((item) => item.date === getTodayISO());

    return {
      total: todays.length,
      active: todays.filter((i) => i.status === 'confirmed' || i.status === 'in_progress').length,
      unassigned: todays.filter(
        (i) => !i.operatorId && i.status !== 'cancelled' && i.status !== 'completed',
      ).length,
      cancelled: todays.filter((i) => i.status === 'cancelled' || i.status === 'rescheduled')
        .length,
    };
  }, [reservations]);

  // Actualiza solo los filtros indicados
  const updateFilters = (partial: Partial<ReservationFilters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  // Crea una reserva nueva con su código consecutivo
  const createReservation = (values: ReservationFormValues) => {
    const code = `#RES-${nextNumber.current}`;
    nextNumber.current += 1;
    setReservations((prev) => [...prev, { ...values, id: `res-${Date.now()}`, code }]);
  };

  // Actualiza una reserva existente
  const updateReservation = (id: string, values: ReservationFormValues) =>
    setReservations((prev) => prev.map((item) => (item.id === id ? { ...item, ...values } : item)));

  return {
    filteredReservations,
    filters,
    stats,
    updateFilters,
    clearFilters,
    createReservation,
    updateReservation,
  };
}
