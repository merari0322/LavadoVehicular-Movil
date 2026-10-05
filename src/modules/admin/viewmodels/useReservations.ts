import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError, apiErrorKey } from '../../../core/api/apiError';
import { bookingService } from '../../../core/services/booking/BookingService';
import { BookingResponse, BookingStatusCode } from '../../../core/services/booking/booking.types';
import { userAdminService } from '../../../core/services/users/UserAdminService';
import { vehicleService } from '../../../core/services/vehicles/VehicleService';
// quién tiene cada reserva (operations-service)
import { AssignmentResponse, operationsService } from '../../../core/services/operations/OperationsService';
import { Alert } from 'react-native';
import { useSharedState } from '../../../shared/hooks/useSharedState';
import {
  BayOption,
  Reservation,
  ReservationFilters,
  ReservationFormValues,
  ReservationStatsData,
  ServiceOption,
} from '../models/reservation';
import { loadReservationCatalog, useReservationCatalog } from '../services/reservationCatalog';
import { addDays, displayToISO, getTodayISO } from '../utils/reservationUtils';

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
  const [filters, setFilters] = useState<ReservationFilters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { services, bays } = useReservationCatalog();

  // Carga las reservas de los últimos 30 días junto con las cuentas (nombres de clientes)
  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [bookings, accounts, assignments] = await Promise.all([
        bookingService.adminBookings(addDays(-29), addDays(1)),
        userAdminService.listAccounts(0, 200).catch(() => []),
        // si operations no responde, las reservas igual se muestran (sin operario)
        operationsService.assignments(addDays(-29), addDays(1)).catch(() => [] as AssignmentResponse[]),
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
      setReservations(bookings.map((booking) => toReservation(booking, accountById)));
    } catch (error) {
      setLoadError(t(apiErrorKey(error)));
    } finally {
      setLoading(false);
    }
  }, [setReservations, t]);

  useEffect(() => {
    void reload();
  }, [reload]);

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
        (i) => !i.operatorId && i.status !== 'cancelled' && i.status !== 'completed' && i.status !== 'no_show',
      ).length,
      cancelled: todays.filter((i) => i.status === 'cancelled' || i.status === 'rescheduled' || i.status === 'no_show')
        .length,
    };
  }, [reservations]);

  // Actualiza solo los filtros indicados
  const updateFilters = (partial: Partial<ReservationFilters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  // Crea la reserva en el booking-service: busca el vehículo por placa y guarda de verdad
  const createReservation = async (values: ReservationFormValues) => {
    const found = await vehicleService.adminFindByPlate(values.plate.replace(/[^A-Z0-9]/g, ''));
    const owned = found[0];
    if (!owned) throw new ApiError('VEHICLE_NOT_FOUND', 404);

    await bookingService.adminCreateBooking({
      vehicleId: owned.vehicle.id,
      serviceIds: [Number(values.serviceId)],
      date: values.date,
      time: values.time,
      notes: values.notes.trim() || null,
    });
    await reload();
  };

  // El backend solo reprograma fecha/hora y notas; los demás campos son de la pantalla
  const updateReservation = async (id: string, values: ReservationFormValues) => {
    await bookingService.adminReschedule(Number(id), {
      date: values.date,
      time: values.time,
      notes: values.notes.trim() || null,
    });
    await reload();
  };

  // Asigna (o cambia) el operario de una reserva; operations valida turno, ausencias y cruces.
  // Devuelve true si quedó asignado (si no, ya mostró el error).
  const assignOperator = async (id: string, operatorId: string): Promise<boolean> => {
    try {
      await operationsService.assign(Number(id), Number(operatorId));
      operatorAssignments.set(id, operatorId);
      setReservations((prev) => prev.map((item) => (item.id === id ? { ...item, operatorId } : item)));
      return true;
    } catch (error) {
      Alert.alert(t('COMMON.ERROR'), t(apiErrorKey(error)));
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
    updateFilters,
    clearFilters,
    createReservation,
    updateReservation,
    assignOperator,
    serviceOptions,
    bayOptions,
  };
}