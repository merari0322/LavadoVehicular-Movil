import { useMemo, useRef, useState } from 'react';
import {
  AbsenceFormValues,
  AssignShiftValues,
  AvailabilityDay,
  Operator,
  OperatorFilter,
  OperatorFormValues,
  OperatorStatus,
  OperatorsSummary,
  Skill,
  TodayService,
  WorkBay,
} from '../models/operator';
import {
  INITIAL_OPERATORS,
  INITIAL_SKILLS,
  INITIAL_TODAY_SERVICES,
  SUMMARY_SERVICES_TREND,
  WORK_BAYS,
  buildAvailability,
} from '../services/operatorMock';
import { normalizeText } from '../utils/managementUtils';

// Genera un id único para los registros nuevos
const newId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Aplica un estado al operario: en permiso médico no puede tener bahía
const withStatus = (operator: Operator, status: OperatorStatus, bayId: string): Operator => ({
  ...operator,
  status,
  bayId: status === 'absent' ? '' : bayId,
  absence: status === 'absent' ? operator.absence : null,
});

// Hook con el estado y la lógica de la pantalla de operarios
export function useOperators() {
  const [operators, setOperators] = useState<Operator[]>(INITIAL_OPERATORS);
  const [filter, setFilter] = useState<OperatorFilter>('all');
  const [search, setSearch] = useState('');
  const nextCode = useRef(8498); // Consecutivo para los códigos nuevos

  // ---------------------------------------------------------------
  // Datos calculados
  // ---------------------------------------------------------------

  // Números de los filtros
  const counts = useMemo<Record<OperatorFilter, number>>(
    () => ({
      all: operators.length,
      available: operators.filter((item) => item.status === 'available').length,
      in_service: operators.filter((item) => item.status === 'in_service').length,
      absent: operators.filter((item) => item.status === 'absent').length,
    }),
    [operators],
  );

  // Operarios que cumplen el filtro y la búsqueda (nombre o especialidad, sin importar tildes)
  const visibleOperators = useMemo(() => {
    const query = normalizeText(search);

    return operators.filter((item) => {
      if (filter !== 'all' && item.status !== filter) return false;
      if (!query) return true;
      return normalizeText(`${item.name} ${item.specialty}`).includes(query);
    });
  }, [operators, filter, search]);

  // Números de las tarjetas de resumen
  const summary = useMemo<OperatorsSummary>(() => {
    const totalReviews = operators.reduce((total, item) => total + item.reviews, 0);
    const weightedRating = operators.reduce((total, item) => total + item.rating * item.reviews, 0);

    return {
      total: operators.length,
      hired: operators.filter((item) => item.contract === 'hired').length,
      interns: operators.filter((item) => item.contract === 'intern').length,
      available: counts.available,
      weeklyServices: operators.reduce((total, item) => total + item.weeklyServices, 0),
      servicesTrend: SUMMARY_SERVICES_TREND,
      averageRating: totalReviews > 0 ? weightedRating / totalReviews : 0,
      totalReviews,
    };
  }, [operators, counts]);

  // ---------------------------------------------------------------
  // Consultas
  // ---------------------------------------------------------------

  const getBayName = (bayId: string): string =>
    WORK_BAYS.find((bay) => bay.id === bayId)?.name ?? '';

  // Bahías libres, más la que ya tiene el operario indicado
  const getAvailableBays = (operatorId?: string): WorkBay[] =>
    WORK_BAYS.filter(
      (bay) => !operators.some((item) => item.id !== operatorId && item.bayId === bay.id),
    );

  const getTodayServices = (operatorId: string): TodayService[] =>
    INITIAL_TODAY_SERVICES.filter((item) => item.operatorId === operatorId);

  const getSkills = (operatorId: string): Skill[] =>
    INITIAL_SKILLS.filter((item) => item.operatorId === operatorId);

  // ---------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------

  // Actualiza un operario aplicando una función
  const updateById = (id: string, updater: (operator: Operator) => Operator) =>
    setOperators((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));

  const createOperator = (values: OperatorFormValues) => {
    const code = `OP-${nextCode.current}`;
    nextCode.current += 1;

    const base: Operator = {
      id: newId('op'),
      code,
      name: values.name,
      specialty: values.specialty,
      phone: values.phone,
      email: values.email,
      status: values.status,
      bayId: values.bayId,
      rating: 0,
      reviews: 0,
      weeklyServices: 0,
      contract: 'hired',
      tags: values.tags,
      availability: buildAvailability(),
      absence: null,
      stats: { servicesTrend: 0, usedHours: 0, capacityHours: 44, punctuality: 100, revenue: 0, goalPercent: 0 },
    };

    setOperators((prev) => [...prev, withStatus(base, values.status, values.bayId)]);
  };

  const updateOperator = (id: string, values: OperatorFormValues) =>
    updateById(id, (item) =>
      withStatus(
        {
          ...item,
          name: values.name,
          specialty: values.specialty,
          phone: values.phone,
          email: values.email,
          tags: values.tags,
        },
        values.status,
        values.bayId,
      ),
    );

  // Asigna estado y bahía del turno
  const assignShift = (values: AssignShiftValues) =>
    updateById(values.operatorId, (item) => withStatus(item, values.status, values.bayId));

  const saveAvailability = (id: string, availability: AvailabilityDay[]) =>
    updateById(id, (item) => ({ ...item, availability }));

  // Registra una incapacidad: el operario pasa a permiso médico y pierde la bahía
  const registerAbsence = (id: string, values: AbsenceFormValues) =>
    updateById(id, (item) => ({ ...item, status: 'absent', bayId: '', absence: values }));

  // Registra el reingreso: vuelve a estar disponible
  const registerReturn = (id: string) =>
    updateById(id, (item) => ({ ...item, status: 'available', absence: null }));

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
    createOperator,
    updateOperator,
    assignShift,
    saveAvailability,
    registerAbsence,
    registerReturn,
  };
}
