import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiErrorKey } from '../../../core/api/apiError';
import {
  AbsenceResponse,
  OperatorProfileResponse,
  OperatorResponse,
  OperatorSkillDto,
  TeamSummaryResponse,
  operationsService,
} from '../../../core/services/operations/OperationsService';
import { useSharedState } from '../../../shared/hooks/useSharedState';
import {
  AbsenceFormValues,
  AvailabilityDay,
  CalendarBlock,
  Operator,
  OperatorFilter,
  Skill,
  TodayService,
  WorkBay,
} from '../models/operator';
import { Reservation } from '../models/reservation';
import { WEEK_DAYS } from '../models/schedule';
import { OPERATOR_TEXTS } from '../constants/operatorTexts';
import { useReservationCatalog } from '../services/reservationCatalog';
import { normalizeText } from '../utils/managementUtils';
import { getTodayISO } from '../utils/reservationUtils';
import { AppAlert } from '../../../shared/components/feedback/AppAlert';

// Operarios reales (operations-service). El nombre, el correo y el teléfono son de la cuenta en
// security (se editan en Gestión → Usuarios); aquí se manejan el turno semanal, las ausencias y
// si el operario está activo. Las reglas (cruces de ausencias, turnos) las valida el backend.

// ausencias reales de cada operario, para poder borrar la de hoy al registrar el reingreso
const absencesByOperator = new Map<string, AbsenceResponse[]>();
let loading: Promise<void> | null = null;

function hhmm(time: string): string {
  return time.slice(0, 5);
}

function localISO(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ausencia del backend (instantes, fin exclusivo) -> días completos de la pantalla
function absenceDays(a: AbsenceResponse): { start: string; end: string } {
  const end = new Date(a.endsAt);
  end.setMinutes(end.getMinutes() - 1);
  return { start: localISO(new Date(a.startsAt)), end: localISO(end) };
}

function toOperator(o: OperatorResponse, absences: AbsenceResponse[], specialty: string): Operator {
  const today = getTodayISO();
  const current = absences.map((a) => ({ ...absenceDays(a), reason: a.reason })).find((a) => a.start <= today && today <= a.end);
  const availability: AvailabilityDay[] = WEEK_DAYS.map((day, index) => {
    const slot = o.week.find((s) => s.dayOfWeek === index + 1);
    return { day, enabled: !!slot, start: slot ? hhmm(slot.startsAt) : '08:00', end: slot ? hhmm(slot.endsAt) : '17:00' };
  });
  return {
    id: String(o.id),
    code: `OP-${o.id}`,
    name: o.fullName || `Operario ${o.id}`,
    specialty,
    phone: o.phone ?? '',
    email: o.email ?? '',
    status: current ? 'absent' : 'available',
    bayId: '',
    rating: o.averageRating ?? 0,
    reviews: o.ratingsCount,
    weeklyServices: o.completedServices,
    tags: o.active ? [] : [OPERATOR_TEXTS.inactiveTag],
    availability,
    absence: current ?? null,
  };
}

// Hook con el estado y la lógica de la pantalla de operarios
export function useOperators() {
  const { t } = useTranslation();
  // compartido con el inicio del admin, el calendario y el modal "Asignar operario"
  const [raw, setRaw] = useSharedState<Operator[]>('admin.operators', []);
  // las reservas las carga useReservations; aquí solo se leen para "servicios de hoy"
  const [reservations] = useSharedState<Reservation[]>('admin.reservations', []);
  // tarjetas del resumen: las calcula operations-service; null mientras carga o si falla
  const [summary, setSummary] = useSharedState<TeamSummaryResponse | null>('admin.operatorsSummary', null);
  // especialidad y habilidades por operario (operations-service)
  const [profiles, setProfiles] = useSharedState<Record<string, OperatorProfileResponse>>('admin.operatorProfiles', {});
  const { services, bays } = useReservationCatalog();
  const [filter, setFilter] = useState<OperatorFilter>('all');
  const [search, setSearch] = useState('');

  const showError = useCallback((error: unknown) => AppAlert.alert(t('COMMON.ERROR'), t(apiErrorKey(error)), undefined, { type: 'error' }), [t]);

  // pide los operarios y sus ausencias
  const reload = useCallback(async () => {
    operationsService.teamSummary().then(setSummary).catch(() => setSummary(null));
    const list = await operationsService.operators();
    // sin perfiles (especialidad y habilidades) los operarios se muestran igual
    const [absences, profileList] = await Promise.all([
      Promise.all(list.map((o) => operationsService.absences(o.id).catch(() => [] as AbsenceResponse[]))),
      operationsService.operatorProfiles().catch(() => [] as OperatorProfileResponse[]),
    ]);
    const byOperator: Record<string, OperatorProfileResponse> = {};
    profileList.forEach((p) => {
      byOperator[String(p.operatorId)] = p;
    });
    list.forEach((o, i) => absencesByOperator.set(String(o.id), absences[i]));
    setProfiles(byOperator);
    setRaw(list.map((o, i) => toOperator(o, absences[i], byOperator[String(o.id)]?.specialty ?? '')));
  }, [setRaw, setSummary, setProfiles]);

  useEffect(() => {
    // se carga una vez (las tarjetas y selectores también usan el hook); las acciones recargan
    if (raw.length === 0 && !loading) {
      loading = reload().catch(() => undefined).finally(() => {
        loading = null;
      });
    }
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "en servicio" si tiene una reserva de hoy en curso
  const operators = useMemo(() => {
    const today = getTodayISO();
    const busy = new Set(
      reservations.filter((r) => r.date === today && r.status === 'in_progress' && r.operatorId).map((r) => r.operatorId),
    );
    return raw.map((o) => (o.status === 'available' && busy.has(o.id) ? { ...o, status: 'in_service' as const } : o));
  }, [raw, reservations]);

  // ---------------------------------------------------------------
  // Datos calculados
  // ---------------------------------------------------------------

  const counts = useMemo<Record<OperatorFilter, number>>(
    () => ({
      all: operators.length,
      available: operators.filter((item) => item.status === 'available').length,
      in_service: operators.filter((item) => item.status === 'in_service').length,
      absent: operators.filter((item) => item.status === 'absent').length,
    }),
    [operators],
  );

  // Operarios que cumplen el filtro y la búsqueda (nombre o correo, sin importar tildes)
  const visibleOperators = useMemo(() => {
    const query = normalizeText(search);
    return operators.filter((item) => {
      if (filter !== 'all' && item.status !== filter) return false;
      if (!query) return true;
      return normalizeText(`${item.name} ${item.email}`).includes(query);
    });
  }, [operators, filter, search]);

  // ---------------------------------------------------------------
  // Consultas
  // ---------------------------------------------------------------

  // los operarios no tienen bahía fija: la bahía va en cada reserva
  const getBayName = (bayId: string): string => bays.find((bay) => String(bay.id) === bayId)?.name ?? '';

  const getAvailableBays = (): WorkBay[] => bays.map((bay) => ({ id: String(bay.id), name: bay.name }));

  // reservas de hoy asignadas al operario
  const getTodayServices = (operatorId: string): TodayService[] => {
    const today = getTodayISO();
    return reservations
      .filter((r) => r.date === today && r.operatorId === operatorId && r.status !== 'cancelled' && r.status !== 'no_show')
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((r) => {
        const [h, m] = r.time.split(':').map(Number);
        const endMinutes = h * 60 + m + r.duration;
        const end = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
        return {
          id: r.id,
          operatorId,
          code: r.code,
          vehicle: `${r.vehicle} · ${r.plate}`,
          service: services.find((s) => String(s.id) === r.serviceId)?.name ?? '',
          bayName: getBayName(r.bayId) || '—',
          start: r.time,
          end,
          status: r.status === 'completed' ? 'completed' : r.status === 'in_progress' ? 'in_progress' : 'scheduled',
        };
      });
  };

  // habilidades guardadas en operations-service (el nivel viaja en mayúsculas)
  const getSkills = (operatorId: string): Skill[] =>
    (profiles[operatorId]?.skills ?? []).map((skill, index) => ({
      id: `${operatorId}-${index}`,
      operatorId,
      name: skill.name,
      level: skill.level.toLowerCase() as Skill['level'],
    }));

  // turno semanal como bloques del calendario (lunes a sábado)
  const getCalendarBlocks = (operatorId: string): CalendarBlock[] => {
    const operator = operators.find((item) => item.id === operatorId);
    if (!operator) return [];
    return operator.availability
      .map((d, index) => ({ d, index }))
      .filter(({ d, index }) => d.enabled && index <= 5)
      .map(({ d, index }) => ({
        day: index,
        start: d.start,
        end: d.end,
        type: 'available' as const,
        label: OPERATOR_TEXTS.calendar.legend.available,
      }));
  };

  // ---------------------------------------------------------------
  // Acciones (el backend valida; después se recarga la lista)
  // ---------------------------------------------------------------

  const run = (action: Promise<unknown>) =>
    action.then(() => reload()).catch(showError);

  // reemplaza el turno semanal (1 = lunes en el backend)
  const saveAvailability = (id: string, availability: AvailabilityDay[]) =>
    run(
      operationsService.setAvailability(
        Number(id),
        availability
          .map((d, index) => ({ d, index }))
          .filter(({ d }) => d.enabled)
          .map(({ d, index }) => ({ dayOfWeek: index + 1, startsAt: d.start, endsAt: d.end })),
      ),
    );

  // ausencia de días completos: del inicio del primer día al inicio del día siguiente al último
  const registerAbsence = (id: string, values: AbsenceFormValues) => {
    const end = new Date(`${values.end}T00:00:00`);
    end.setDate(end.getDate() + 1);
    return run(operationsService.addAbsence(Number(id), `${values.start}T00:00:00`, `${localISO(end)}T00:00:00`, values.reason));
  };

  // reingreso: se borra la ausencia que cubre hoy
  const registerReturn = (id: string) => {
    const today = getTodayISO();
    const current = (absencesByOperator.get(id) ?? []).filter((a) => {
      const days = absenceDays(a);
      return days.start <= today && today <= days.end;
    });
    return run(Promise.all(current.map((a) => operationsService.removeAbsence(Number(id), a.id))));
  };

  // especialidad y habilidades: guardar reemplaza la lista completa. Devuelve null o el error
  const saveProfile = async (id: string, specialty: string, skills: Skill[]): Promise<string | null> => {
    const payload: OperatorSkillDto[] = skills.map((skill) => ({
      name: skill.name.trim(),
      level: skill.level.toUpperCase() as OperatorSkillDto['level'],
    }));
    try {
      await operationsService.updateOperatorProfile(Number(id), specialty.trim() || null, payload);
      await reload();
      return null;
    } catch (error) {
      return t(apiErrorKey(error));
    }
  };

  // dar de alta o de baja (no se borra: tiene servicios y calificaciones)
  const setActive = (id: string, active: boolean) => run(operationsService.setActive(Number(id), active));

  return {
    operators,
    visibleOperators,
    filter,
    setFilter,
    search,
    setSearch,
    counts,
    summary,
    getBayName,
    getAvailableBays,
    getTodayServices,
    getSkills,
    saveProfile,
    getCalendarBlocks,
    saveAvailability,
    registerAbsence,
    registerReturn,
    setActive,
    reload,
  };
}
