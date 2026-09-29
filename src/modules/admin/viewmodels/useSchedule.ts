import { useMemo, useState } from 'react';
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
import {
  INITIAL_BAYS,
  INITIAL_EXCEPTIONS,
  INITIAL_HISTORY,
  INITIAL_WEEK,
  SCHEDULE_ACTOR,
} from '../services/scheduleMock';
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

// Genera un id único para los registros nuevos
const newId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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

// Hook con el estado y la lógica de la pantalla de horarios y bahías
export function useSchedule() {
  // Horario guardado y borrador que se está editando
  const [savedWeek, setSavedWeek] = useState<DaySchedule[]>(INITIAL_WEEK);
  const [draftWeek, setDraftWeek] = useState<DaySchedule[]>(INITIAL_WEEK);
  const [exceptions, setExceptions] = useState<ScheduleException[]>(INITIAL_EXCEPTIONS);
  const [bays, setBays] = useState<Bay[]>(INITIAL_BAYS);
  const [history, setHistory] = useState<HistoryEntry[]>(INITIAL_HISTORY);

  // ---------------------------------------------------------------
  // Historial
  // ---------------------------------------------------------------

  // Agrega un movimiento al inicio del historial
  const addHistory = (title: string, detail = '') =>
    setHistory((prev) => [
      { id: newId('his'), title, detail, date: getTodayISO(), author: SCHEDULE_ACTOR },
      ...prev,
    ]);

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

  // Guarda el horario (devuelve false si hay errores)
  const saveWeek = (): boolean => {
    if (Object.keys(weekErrors).length > 0) return false;
    setSavedWeek(draftWeek);
    addHistory(SCHEDULE_TEXTS.historyModal.weekUpdated);
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

  const createException = (values: ExceptionFormValues) => {
    setExceptions((prev) => [...prev, { id: newId('exc'), ...values }]);
    addHistory(SCHEDULE_TEXTS.exceptions.history.added, values.description);
  };

  const updateException = (id: string, values: ExceptionFormValues) => {
    setExceptions((prev) => prev.map((item) => (item.id === id ? { ...item, ...values } : item)));
    addHistory(SCHEDULE_TEXTS.exceptions.history.updated, values.description);
  };

  const deleteException = (id: string) => {
    const target = exceptions.find((item) => item.id === id);
    setExceptions((prev) => prev.filter((item) => item.id !== id));
    if (target) addHistory(SCHEDULE_TEXTS.exceptions.history.deleted, target.description);
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

  const createBay = (values: BayFormValues) => {
    setBays((prev) => [...prev, { id: newId('bay'), ...values }]);
    addHistory(SCHEDULE_TEXTS.bays.history.added, values.name);
  };

  const updateBay = (id: string, values: BayFormValues) => {
    setBays((prev) => prev.map((bay) => (bay.id === id ? { ...bay, ...values } : bay)));
    addHistory(SCHEDULE_TEXTS.bays.history.updated, values.name);
  };

  // Cambia solo el estado de una bahía (activa, mantenimiento o inactiva)
  const changeBayStatus = (id: string, status: BayStatus) => {
    const target = bays.find((bay) => bay.id === id);
    if (!target || target.status === status) return;

    setBays((prev) => prev.map((bay) => (bay.id === id ? { ...bay, status } : bay)));
    addHistory(
      SCHEDULE_TEXTS.bays.history.statusChanged,
      `${target.name} · ${SCHEDULE_TEXTS.bays.status[status]}`,
    );
  };

  const deleteBay = (id: string) => {
    const target = bays.find((bay) => bay.id === id);
    setBays((prev) => prev.filter((bay) => bay.id !== id));
    if (target) addHistory(SCHEDULE_TEXTS.bays.history.deleted, target.name);
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
  };
}
