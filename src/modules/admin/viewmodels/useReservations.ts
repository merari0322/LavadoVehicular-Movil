import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError, apiErrorKey } from '../../../core/api/apiError';
import { bookingService } from '../../../core/services/booking/BookingService';
import { BookingResponse, BookingStatusCode } from '../../../core/services/booking/booking.types';
import { userAdminService } from '../../../core/services/users/UserAdminService';
import { vehicleService } from '../../../core/services/vehicles/VehicleService';
// quién tiene cada reserva (operations-service)
import {
  AssignmentResponse,
  ToCloseResponse,
  UnassignedResponse,
  operationsService,
} from '../../../core/services/operations/OperationsService';
import { useSharedState } from '../../../shared/hooks/useSharedState';
import {
  BayOption,
  Reservation,
  ReservationFilters,
  ReservationFormValues,
  ReservationStatsData,
  ServiceOption,
  isReschedulable,
  nextStatuses,
} from '../models/reservation';
import { loadReservationCatalog, useReservationCatalog } from '../services/reservationCatalog';
import { addDays, displayToISO, getTodayISO } from '../utils/reservationUtils';
import { AppAlert } from '../../../shared/components/feedback/AppAlert';

// estados del booking-service -> estados de la pantalla
const STATUS_TO_LOCAL: Record<BookingStatusCode, Reservation['status']> = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

// reserva -> operario asignado (operations-service), se refresca en cada recarga
const operatorAssignments = new Map<string, string>();

// ventana de reservas que se carga: igual que la web (30 días atrás y 31 adelante)
const DAYS_BACK = 29;
const DAYS_AHEAD = 31;

// misma regla que operations, solo si operations no responde: programada o confirmada, sin operario y
// que todavía no termina
function needsOperatorLocally(item: Reservation): boolean {
  if ((item.status !== 'confirmed' && item.status !== 'scheduled') || item.operatorId) return false;
  const [hours, minutes] = item.time.split(':').map(Number);
  const end = new Date(`${item.date}T00:00:00`);
  end.setHours(hours, minutes + item.duration, 0, 0);
  return end.getTime() > Date.now();
}

/** reserva con operario que terminó y nadie registró (la cierra el admin) */
export interface ToCloseItem {
  reservation: Reservation;
  reason: ToCloseResponse['reason'];
  operatorId: string;
}

// Filtros sin ningún valor aplicado
export const EMPTY_FILTERS: ReservationFilters = {
  search: '',
  date: '',
  status: '',
  operatorId: '',
};

// Deja solo letras y números en minúscula (así "wqx115" encuentra "WQX-115")
const normalize = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]/g, '');

// Arma la reserva de la pantalla desde la respuesta del booking-service; el nombre,
// teléfono y correo del cliente se resuelven con las cuentas reales del security-service.
function toReservation(
  booking: BookingResponse,
  accountById: Map<string, { fullName: string; email: string; phone: string }>,
): Reservation {
  const account = booking.ownerUserId != null ? accountById.get(String(booking.ownerUserId)) : undefined;
  const hasVehicleName =
    booking.vehicle && (booking.vehicle.brand || booking.vehicle.model);
  const vehicleLabel = hasVehicleName
    ? `${booking.vehicle?.brand ?? ''} ${booking.vehicle?.model ?? ''}`.trim()
    : (booking.vehicle?.vehicleTypeName ?? '—');
  const firstService = booking.services[0];

  return {
    id: String(booking.id),
    code: booking.code,
    customerName: account?.fullName ?? (booking.ownerUserId != null ? 'Cliente' : '—'),
    phone: account?.phone ?? '',
    email: account?.email ?? '',
    vehicle: vehicleLabel,
    plate: booking.vehicle?.licensePlateFormatted ?? '—',
    serviceId: firstService ? String(firstService.serviceId) : '',
    date: booking.date,
    time: booking.startTime,
    duration: booking.durationMinutes,
    bayId: booking.bay ? String(booking.bay.id) : '',
    operatorId: operatorAssignments.get(String(booking.id)) ?? '',
    status: STATUS_TO_LOCAL[booking.status] ?? 'scheduled',
    notes: booking.notes ?? '',
  };
}

// Hook con el estado y la lógica de la pantalla de reservas (datos reales del booking-service)
export function useReservations() {
  const { t } = useTranslation();
  // compartido con el inicio del admin (asignar operario desde el dashboard)
  const [reservations, setReservations] = useSharedState<Reservation[]>('admin.reservations', []);
  // las que necesitan operario (regla de operations) y las que quedaron por cerrar, compartidas con el inicio
  const [unassignedIds, setUnassignedIds] = useSharedState<string[]>('admin.unassignedIds', []);
  const [toCloseList, setToCloseList] = useSharedState<ToCloseResponse[]>('admin.toClose', []);
  const [filters, setFilters] = useState<ReservationFilters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { services, bays } = useReservationCatalog();

  // Carga las reservas de la ventana junto con las cuentas (nombres de clientes).
  // silent: refresco al volver a la pantalla o al llegar una push, sin el indicador de carga
  const load = useCallback(async (silent: boolean) => {
    if (!silent) {
      setLoading(true);
      setLoadError(null);
    }
    try {
      const [bookings, accounts, assignments, unassigned, toClose] = await Promise.all([
        bookingService.adminBookings(addDays(-DAYS_BACK), addDays(DAYS_AHEAD)),
        userAdminService.listAccounts().catch(() => []),
        // si operations no responde, las reservas igual se muestran (sin operario)
        operationsService.assignments(addDays(-DAYS_BACK), addDays(DAYS_AHEAD)).catch(() => [] as AssignmentResponse[]),
        operationsService.unassigned(getTodayISO(), addDays(DAYS_AHEAD)).catch(() => null as UnassignedResponse | null),
        operationsService.toClose().catch(() => [] as ToCloseResponse[]),
      ]);
      operatorAssignments.clear();
      assignments.forEach((a) => operatorAssignments.set(String(a.bookingId), String(a.operatorId)));
      // los nombres de servicios y bahías casi no cambian: se piden una vez por sesión
      await loadReservationCatalog().catch(() => undefined);

      const accountById = new Map(
        accounts.map((account) => [
          String(account.id),
          { fullName: account.fullName, email: account.email, phone: account.phone ?? '' },
        ]),
      );
      const list = bookings.map((booking) => toReservation(booking, accountById));
      setReservations(list);
      setUnassignedIds(unassigned
        ? unassigned.bookingIds.map(String)
        : list.filter(needsOperatorLocally).map((item) => item.id));
      setToCloseList(toClose);
      setLoadError(null);
    } catch (error) {
      // si falla un refresco silencioso se quedan los datos que ya se ven
      if (!silent) setLoadError(t(apiErrorKey(error)));
    } finally {
      setLoading(false);
    }
  }, [setReservations, setUnassignedIds, setToCloseList, t]);

  const reload = useCallback(() => load(false), [load]);
  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // la reserva todavía necesita operario (una sola regla para el inicio y reservas)
  const isUnassigned = useCallback((item: Reservation) => unassignedIds.includes(item.id), [unassignedIds]);

  // las que necesitan operario, de la más próxima a la más lejana
  const unassigned = useMemo(
    () => reservations.filter((item) => isUnassigned(item)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [reservations, isUnassigned],
  );

  // por cerrar: terminaron con operario y nadie las registró
  const toClose = useMemo<ToCloseItem[]>(
    () =>
      toCloseList
        .map((item) => ({
          reservation: reservations.find((r) => r.id === String(item.bookingId)),
          reason: item.reason,
          operatorId: String(item.operatorId),
        }))
        .filter((item): item is ToCloseItem => item.reservation !== undefined)
        .sort((a, b) =>
          `${a.reservation.date}${a.reservation.time}`.localeCompare(`${b.reservation.date}${b.reservation.time}`),
        ),
    [toCloseList, reservations],
  );

  // Reservas que cumplen los filtros, ordenadas por fecha y hora
  const filteredReservations = useMemo(() => {
    const query = normalize(filters.search);
    const dateISO = displayToISO(filters.date);

    return reservations
      .filter((item) => {
        // Búsqueda por cliente, placa, código o teléfono
        if (query) {
          const haystack = normalize([item.customerName, item.plate, item.code, item.phone].join(' '));
          if (!haystack.includes(query)) return false;
        }

        // Fecha (solo se aplica si el texto es una fecha completa y válida)
        if (dateISO && item.date !== dateISO) return false;

        // Estado
        if (filters.status && item.status !== filters.status) return false;

        // Operario
        if (filters.operatorId === 'unassigned') return isUnassigned(item);
        if (filters.operatorId && item.operatorId !== filters.operatorId) return false;

        return true;
      })
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [reservations, filters, isUnassigned]);

  // Estadísticas de las reservas de hoy
  const stats = useMemo<ReservationStatsData>(() => {
    const todays = reservations.filter((item) => item.date === getTodayISO());

    return {
      total: todays.length,
      active: todays.filter((i) => i.status === 'confirmed' || i.status === 'in_progress').length,
      unassigned: todays.filter((item) => isUnassigned(item)).length,
      cancelled: todays.filter((i) => i.status === 'cancelled' || i.status === 'rescheduled' || i.status === 'no_show')
        .length,
    };
  }, [reservations, isUnassigned]);

  // Actualiza solo los filtros indicados
  const updateFilters = (partial: Partial<ReservationFilters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  // Crea la reserva en el booking-service: busca el vehículo por placa y guarda de verdad
  const createReservation = async (values: ReservationFormValues) => {
    const found = await vehicleService.adminFindByPlate(values.plate.replace(/[^A-Z0-9]/g, ''));
    const owned = found[0];
    if (!owned) throw new ApiError('VEHICLE_NOT_FOUND', 404);

    const created = await bookingService.adminCreateBooking({
      vehicleId: owned.vehicle.id,
      serviceIds: [Number(values.serviceId)],
      date: values.date,
      time: values.time,
      notes: values.notes.trim() || null,
    });
    try {
      // si el admin eligió operario, ese queda (si no, operations asigna uno solo)
      if (values.operatorId) await operationsService.assign(created.id, Number(values.operatorId));
    } finally {
      await reload();
    }
  };

  // Guarda lo que cambió en el formulario: fecha/hora/notas en booking (reprogramar), el operario en
  // operations y el estado en booking. MOV-05: todo se revisa antes de llamar al backend y, si un paso
  // falla después de reprogramar, la fecha vuelve a la de antes, para que no quede guardado a medias
  const updateReservation = async (id: string, values: ReservationFormValues) => {
    const current = reservations.find((item) => item.id === id);
    const notes = values.notes.trim();
    const statusChanged = !!current && values.status !== current.status && values.status !== 'rescheduled';
    if (current && statusChanged && !nextStatuses(current.status, Boolean(current.bayId)).includes(values.status)) {
      throw new ApiError('INVALID_STATUS_TRANSITION', 409);
    }
    // cancelar o marcar no asistida cierra la reserva: la fecha y el operario ya no aplican
    const closing = statusChanged && (values.status === 'cancelled' || values.status === 'no_show');
    const reschedule =
      !closing && (!current || values.date !== current.date || values.time !== current.time || notes !== current.notes.trim());
    if (reschedule && current && !isReschedulable(current.status)) {
      throw new ApiError('BOOKING_NOT_CHANGEABLE', 409);
    }
    const assign = !closing && !!values.operatorId && values.operatorId !== current?.operatorId;

    try {
      if (reschedule) {
        await bookingService.adminReschedule(Number(id), { date: values.date, time: values.time, notes: notes || null });
      }
      try {
        if (assign) await operationsService.assign(Number(id), Number(values.operatorId));
        if (statusChanged) {
          // el admin cancela con el motivo OTHER, igual que en la web
          await bookingService.adminChangeStatus(Number(id), values.status.toUpperCase() as BookingStatusCode,
            values.status === 'cancelled' ? 'OTHER' : undefined);
        }
      } catch (error) {
        if (reschedule && current) {
          // se deshace la reprogramación; si tampoco se puede, la lista recargada muestra lo que quedó
          await bookingService
            .adminReschedule(Number(id), { date: current.date, time: current.time, notes: current.notes.trim() || null })
            .catch(() => undefined);
        }
        throw error;
      }
    } finally {
      await reload();
    }
  };

  // Asigna (o cambia) el operario de una reserva; operations valida turno, ausencias y cruces.
  // Devuelve true si quedó asignado (si no, ya mostró el error).
  const assignOperator = async (id: string, operatorId: string): Promise<boolean> => {
    try {
      await operationsService.assign(Number(id), Number(operatorId));
      operatorAssignments.set(id, operatorId);
      setReservations((prev) => prev.map((item) => (item.id === id ? { ...item, operatorId } : item)));
      setUnassignedIds((prev) => prev.filter((other) => other !== id));
      return true;
    } catch (error) {
      AppAlert.alert(t('COMMON.ERROR'), t(apiErrorKey(error)), undefined, { type: 'error' });
      return false;
    }
  };

  // "Se atendió": la reserva queda completada con su operario. Devuelve true si se cerró.
  const closeAsAttended = async (id: string): Promise<boolean> => {
    try {
      await operationsService.closeAsAttended(Number(id));
      setReservations((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'completed' } : item)));
      setToCloseList((prev) => prev.filter((item) => String(item.bookingId) !== id));
      return true;
    } catch (error) {
      AppAlert.alert(t('COMMON.ERROR'), t(apiErrorKey(error)), undefined, { type: 'error' });
      return false;
    }
  };

  // "No asistió": solo para una que nunca se inició (el backend lo valida)
  const markNoShow = async (id: string): Promise<boolean> => {
    try {
      await bookingService.adminChangeStatus(Number(id), 'NO_SHOW');
      setReservations((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'no_show' } : item)));
      setToCloseList((prev) => prev.filter((item) => String(item.bookingId) !== id));
      return true;
    } catch (error) {
      AppAlert.alert(t('COMMON.ERROR'), t(apiErrorKey(error)), undefined, { type: 'error' });
      return false;
    }
  };

  // opciones reales para el formulario de crear/editar
  const serviceOptions = useMemo<ServiceOption[]>(
    () =>
      services.map((item) => ({
        id: String(item.id),
        name: item.name,
        duration: item.prices[0]?.estimatedMinutes ?? 0,
      })),
    [services],
  );
  const bayOptions = useMemo<BayOption[]>(
    () => bays.map((item) => ({ id: String(item.id), name: item.name })),
    [bays],
  );

  return {
    reservations,
    filteredReservations,
    filters,
    stats,
    loading,
    loadError,
    reload,
    refresh,
    updateFilters,
    clearFilters,
    createReservation,
    updateReservation,
    assignOperator,
    isUnassigned,
    unassigned,
    toClose,
    closeAsAttended,
    markNoShow,
    serviceOptions,
    bayOptions,
  };
}