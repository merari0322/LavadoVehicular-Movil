import { useCallback, useEffect, useMemo, useState } from 'react';
import { bookingService } from '../../../core/services/booking/BookingService';
import {
  BayResponse,
  BayStatusCode,
  BusinessHourDto,
  HoursExceptionRequest,
  HoursExceptionResponse,
  ScheduleHistoryEntryResponse,
} from '../../../core/services/booking/booking.types';
import { useSession } from '../../../core/services/auth';
import { SCHEDULE_TEXTS } from '../constants/scheduleTexts';
import {
  BREAK_OPTIONS,
  Bay,
  BayFormValues,
  BayStatus,
  DaySchedule,
  ExceptionFormValues,
  HistoryEntry,
  ScheduleException,
  WeekDay,
} from '../models/schedule';
import { INITIAL_BAYS, INITIAL_EXCEPTIONS, INITIAL_WEEK } from '../services/scheduleMock';
import { getTodayISO, isValidTime } from '../utils/reservationUtils';

// Resultado de validar el horario semanal: un mensaje de error por día
export type WeekErrors = Partial<Record<WeekDay, string>>;

// Día de la semana según Date.getDay() (0 = domingo)
const JS_DAYS: WeekDay[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

// El booking-service numera los días 1 = lunes ... 7 = domingo
const DAY_BY_NUMBER: Record<number, WeekDay> = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'sunday',
};
const NUMBER_BY_DAY: Record<WeekDay, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

// códigos de estado de bahía del backend -> estado de la pantalla (y al revés)
const BAY_STATUS_BY_CODE: Record<BayStatusCode, BayStatus> = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
};
const BAY_CODE_BY_STATUS: Record<BayStatus, BayStatusCode> = {
  active: 'ACTIVE',
  maintenance: 'MAINTENANCE',
  inactive: 'INACTIVE',
};

// Horario del backend (BusinessHourDto) -> horario de la pantalla
const hourToDay = (hour: BusinessHourDto): DaySchedule => ({
  day: DAY_BY_NUMBER[hour.dayOfWeek] ?? 'monday',
  open: hour.working,
  opening: hour.opensAt,
  closing: hour.closesAt,
  breakId: hour.breakStartsAt && hour.breakEndsAt ? `${hour.breakStartsAt}-${hour.breakEndsAt}` : '',
});

// Horario de la pantalla -> el que espera el backend al guardar
const dayToHour = (day: DaySchedule): BusinessHourDto => {
  const breakRange = day.breakId ? day.breakId.split('-') : null;
  return {
    dayOfWeek: NUMBER_BY_DAY[day.day],
    working: day.open,
    opensAt: day.opening,
    closesAt: day.closing,
    breakStartsAt: day.open && breakRange ? breakRange[0] : null,
    breakEndsAt: day.open && breakRange ? breakRange[1] : null,
  };
};

// Excepción del backend -> excepción de la pantalla. El "tipo" no existe en el backend:
// es solo visual (festivo si está cerrada, especial si no).
const exceptionToLocal = (exception: HoursExceptionResponse): ScheduleException => ({
  id: String(exception.id),
  date: exception.date,
  type: exception.closed ? 'holiday' : 'special',
  closedAllDay: exception.closed,
  opening: exception.opensAt ?? '09:00',
  closing: exception.closesAt ?? '18:00',
  description: exception.reason,
});

// Excepción de la pantalla -> la que espera el backend al guardar
const exceptionToRequest = (values: ExceptionFormValues): HoursExceptionRequest => ({
  date: values.date,
  closed: values.closedAllDay,
  opensAt: values.closedAllDay ? null : values.opening,
  closesAt: values.closedAllDay ? null : values.closing,
  reason: values.description,
});

// Bahía del backend -> bahía de la pantalla. Sin operatorId: el operario no queda fijo en una
// bahía por turno (ADR-015 reafirma ADR-010); el par operario-bahía es por reserva, se ve en
// Reservas (ReservationCard) y en operation-service (assignments()).
const bayToLocal = (bay: BayResponse): Bay => ({
  id: String(bay.id),
  name: bay.name,
  status: BAY_STATUS_BY_CODE[bay.status] ?? 'inactive',
});

// Valida cada día laboral: horas correctas, apertura antes del cierre y pausa dentro del horario
const validateWeek = (week: DaySchedule[]): WeekErrors => {
  const errors: WeekErrors = {};
  const messages = SCHEDULE_TEXTS.week.errors;

  week.forEach((item) => {
    if (!item.open) return;

    if (!isValidTime(item.opening) || !isValidTime(item.closing)) {
      errors[item.day] = messages.time;
      return;
    }

    if (item.opening >= item.closing) {
      errors[item.day] = messages.range;
      return;
    }

    const pause = BREAK_OPTIONS.find((option) => option.id === item.breakId);
    if (pause && (pause.start < item.opening || pause.end > item.closing)) {
      errors[item.day] = messages.pause;
    }
  });

  return errors;
};

// Hook con el estado y la lógica de la pantalla de horarios y bahías: todo viene del
// booking-service real, incluido el historial de cambios (migraciones 021 y 022)
export function useSchedule() {
  const { user } = useSession();

  // Horario guardado y borrador que se está editando. Se arranca con los datos de
  // ejemplo y la primera carga real los reemplaza (así la pantalla nunca se ve vacía).
  const [savedWeek, setSavedWeek] = useState<DaySchedule[]>(INITIAL_WEEK);
  const [draftWeek, setDraftWeek] = useState<DaySchedule[]>(INITIAL_WEEK);
  const [exceptions, setExceptions] = useState<ScheduleException[]>(INITIAL_EXCEPTIONS);
  const [bays, setBays] = useState<Bay[]>(INITIAL_BAYS);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Movimiento del backend -> fila de la pantalla. changed_by es el id de la cuenta; solo se
  // resuelve el nombre cuando es quien tiene la sesión (no hay directorio de usuarios aquí).
  const historyToLocal = useCallback(
    (entry: ScheduleHistoryEntryResponse): HistoryEntry => ({
      id: String(entry.id),
      title: entry.title,
      detail: entry.detail ?? '',
      date: entry.changedAt.slice(0, 10),
      author: entry.changedBy != null && String(entry.changedBy) === user?.id
        ? user.fullName
        : SCHEDULE_TEXTS.historyModal.unknownAuthor,
    }),
    [user],
  );

  const reloadHistory = useCallback(async () => {
    try {
      setHistory((await bookingService.scheduleHistory()).map(historyToLocal));
    } catch {
      // si falla, la pantalla se queda con el historial que ya tenía
    }
  }, [historyToLocal]);

  // Carga horario semanal, excepciones, bahías e historial desde el booking-service
  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [hours, exceptionList, bayList] = await Promise.all([
        bookingService.businessHours(),
        bookingService.exceptions(),
        bookingService.bays(),
      ]);
      const week = hours.map(hourToDay);
      setSavedWeek(week);
      setDraftWeek(week);
      setExceptions(exceptionList.map(exceptionToLocal));
      setBays(bayList.map(bayToLocal));
      await reloadHistory();
    } catch (error) {
      // se dejan los datos de ejemplo y se reporta para que la pantalla decida
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [reloadHistory]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // ---------------------------------------------------------------
  // Horario semanal
  // ---------------------------------------------------------------

  const weekErrors = useMemo(() => validateWeek(draftWeek), [draftWeek]);
  const isDirty = useMemo(
    () => JSON.stringify(savedWeek) !== JSON.stringify(draftWeek),
    [savedWeek, draftWeek],
  );

  // Cambia solo los campos indicados de un día
  const updateDay = (day: WeekDay, partial: Partial<DaySchedule>) =>
    setDraftWeek((prev) => prev.map((item) => (item.day === day ? { ...item, ...partial } : item)));

  // Descarta los cambios y vuelve al último horario guardado
  const resetWeek = () => setDraftWeek(savedWeek);

  // Guarda el horario en el booking-service (devuelve false si hay errores de validación)
  const saveWeek = async (): Promise<boolean> => {
    if (Object.keys(weekErrors).length > 0) return false;

    await bookingService.saveBusinessHours(draftWeek.map(dayToHour));
    setSavedWeek(draftWeek);
    await reloadHistory();
    return true;
  };

  // Horario de hoy para la etiqueta del encabezado (null = cerrado)
  const todayRange = useMemo<string | null>(() => {
    const exception = exceptions.find((item) => item.date === getTodayISO());
    if (exception) {
      return exception.closedAllDay ? null : `${exception.opening} - ${exception.closing}`;
    }

    const today = savedWeek.find((item) => item.day === JS_DAYS[new Date().getDay()]);
    return today && today.open ? `${today.opening} - ${today.closing}` : null;
  }, [savedWeek, exceptions]);

  // ---------------------------------------------------------------
  // Excepciones
  // ---------------------------------------------------------------

  // Excepciones ordenadas por fecha
  const sortedExceptions = useMemo(
    () => [...exceptions].sort((a, b) => a.date.localeCompare(b.date)),
    [exceptions],
  );

  // Indica si ya hay una excepción en esa fecha (se ignora la que se edita)
  const isDateTaken = (date: string, ignoreId?: string): boolean =>
    exceptions.some((item) => item.id !== ignoreId && item.date === date);

  const createException = async (values: ExceptionFormValues) => {
    const created = await bookingService.createException(exceptionToRequest(values));
    setExceptions((prev) => [...prev, exceptionToLocal(created)]);
    await reloadHistory();
  };

  const updateException = async (id: string, values: ExceptionFormValues) => {
    const updated = await bookingService.updateException(Number(id), exceptionToRequest(values));
    setExceptions((prev) => prev.map((item) => (item.id === String(updated.id) ? exceptionToLocal(updated) : item)));
    await reloadHistory();
  };

  const deleteException = async (id: string) => {
    await bookingService.deleteException(Number(id));
    setExceptions((prev) => prev.filter((item) => item.id !== id));
    await reloadHistory();
  };

  // ---------------------------------------------------------------
  // Bahías
  // ---------------------------------------------------------------

  const activeBays = useMemo(() => bays.filter((bay) => bay.status === 'active').length, [bays]);

  // Indica si ya existe una bahía con ese nombre (se ignora la que se edita)
  const isBayNameTaken = (name: string, ignoreId?: string): boolean =>
    bays.some(
      (bay) => bay.id !== ignoreId && bay.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );

  const createBay = async (values: BayFormValues) => {
    const created = await bookingService.createBay(values.name, BAY_CODE_BY_STATUS[values.status]);
    setBays((prev) => [...prev, bayToLocal(created)]);
    await reloadHistory();
  };

  const updateBay = async (id: string, values: BayFormValues) => {
    const updated = await bookingService.updateBay(Number(id), values.name, BAY_CODE_BY_STATUS[values.status]);
    setBays((prev) => prev.map((bay) => (bay.id === String(updated.id) ? bayToLocal(updated) : bay)));
    await reloadHistory();
  };

  // Cambia solo el estado de una bahía (activa, mantenimiento o inactiva)
  const changeBayStatus = async (id: string, status: BayStatus) => {
    const target = bays.find((bay) => bay.id === id);
    if (!target || target.status === status) return;

    const updated = await bookingService.updateBay(Number(id), target.name, BAY_CODE_BY_STATUS[status]);
    setBays((prev) => prev.map((bay) => (bay.id === String(updated.id) ? bayToLocal(updated) : bay)));
    await reloadHistory();
  };

  const deleteBay = async (id: string) => {
    await bookingService.deleteBay(Number(id));
    setBays((prev) => prev.filter((bay) => bay.id !== id));
    await reloadHistory();
  };

  return {
    // Horario semanal
    draftWeek,
    weekErrors,
    isDirty,
    todayRange,
    updateDay,
    resetWeek,
    saveWeek,
    // Excepciones
    exceptions: sortedExceptions,
    isDateTaken,
    createException,
    updateException,
    deleteException,
    // Bahías
    bays,
    activeBays,
    isBayNameTaken,
    createBay,
    updateBay,
    changeBayStatus,
    deleteBay,
    // Historial
    history,
    // Carga
    loading,
    loadError,
    reload,
  };
}