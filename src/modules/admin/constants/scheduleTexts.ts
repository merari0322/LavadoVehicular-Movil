import { BayStatus, ExceptionType, ScheduleTab, WeekDay } from '../models/schedule';

// Textos de la pantalla de horarios y bahías (centralizados para migrarlos fácil a i18n)
export const SCHEDULE_TEXTS = {
  title: 'Horarios y bahías',
  subtitle:
    'Configura los turnos de atención comercial, días no laborables y la disponibilidad de las bahías de servicio',
  history: 'Historial',
  openToday: (range: string) => `Abierto hoy · ${range}`,
  closedToday: 'Cerrado hoy',

  common: {
    cancel: 'Cancelar',
    delete: 'Eliminar',
    close: 'Cerrar',
  },

  tabs: {
    hours: 'Horario del negocio',
    bays: 'Bahías de lavado',
  } as Record<ScheduleTab, string>,
  weeklyBadge: 'Semanal',
  activeBays: (total: number) => (total === 1 ? '1 activa' : `${total} activas`),

  days: {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
  } as Record<WeekDay, string>,

  // ---------------- Horario semanal ----------------
  week: {
    title: 'Horario semanal regular',
    description:
      'Define las horas de apertura y cierre para cada día de la semana. Los turnos de reserva se generarán dentro de este rango.',
    timezone: 'Zona horaria: America/Bogota (COT)',
    working: 'Laboral',
    rest: 'Descanso',
    opening: 'Apertura',
    closing: 'Cierre',
    pause: 'Pausa',
    noPause: 'Continuo (sin pausa)',
    notApplicable: 'No aplica',
    open: 'Abierto',
    closed: 'Cerrado',
    info: 'Los cambios impactan el motor de reservas en tiempo real.',
    reset: 'Restablecer valores',
    save: 'Guardar cambios',
    savedTitle: 'Horario guardado',
    savedMessage: 'Los cambios ya se aplican al motor de reservas.',
    invalidTitle: 'Revisa los horarios',
    invalidMessage: 'Corrige los días marcados en rojo antes de guardar.',
    errors: {
      time: 'Usa el formato hh:mm en 24 horas (ej. 18:30)',
      range: 'La apertura debe ser antes del cierre',
      pause: 'La pausa debe estar dentro del horario de atención',
    },
  },

  // ---------------- Excepciones ----------------
  exceptions: {
    title: 'Excepciones y días especiales',
    count: (total: number) => (total === 1 ? '1 programado' : `${total} programados`),
    subtitle:
      'Sobrescribe el horario habitual en feriados nacionales, mantenimientos programados o jornadas reducidas.',
    add: 'Agregar excepción',
    empty: 'No hay excepciones programadas',
    emptyHint: 'Agrega la primera con el botón de arriba',
    closedAllDay: 'Cerrado todo el día',
    types: {
      holiday: 'Festivo nacional',
      special: 'Horario especial',
      maintenance: 'Mantenimiento',
    } as Record<ExceptionType, string>,
    deleteTitle: 'Eliminar excepción',
    deleteMessage: (date: string) =>
      `¿Seguro que quieres eliminar la excepción del ${date}? Esta acción no se puede deshacer.`,
    form: {
      createTitle: 'Agregar excepción',
      editTitle: 'Editar excepción',
      date: 'Fecha',
      datePlaceholder: 'dd/mm/aaaa',
      type: 'Tipo',
      closedAllDay: 'Cerrado todo el día',
      opening: 'Apertura',
      closing: 'Cierre',
      description: 'Motivo / descripción',
      descriptionPlaceholder: 'Ej. Día de la Independencia de Cartagena',
      save: 'Guardar excepción',
      errors: {
        date: 'Fecha inválida (dd/mm/aaaa)',
        duplicate: 'Ya existe una excepción en esa fecha',
        time: 'Hora inválida (hh:mm)',
        range: 'La apertura debe ser antes del cierre',
      },
    },
    history: {
      added: 'Excepción agregada',
      updated: 'Excepción actualizada',
      deleted: 'Excepción eliminada',
    },
  },

  // ---------------- Bahías ----------------
  bays: {
    title: 'Bahías de lavado',
    subtitle: 'Activa, desactiva o pon en mantenimiento cada bahía física del local.',
    add: 'Agregar bahía',
    currentOperator: (name: string) => `Operario actual: ${name}`,
    unassigned: 'Sin asignar',
    state: 'Estado',
    empty: 'No hay bahías registradas',
    emptyHint: 'Agrega la primera con el botón de arriba',
    status: {
      active: 'Activa',
      maintenance: 'En mantenimiento',
      inactive: 'Inactiva',
    } as Record<BayStatus, string>,
    deleteTitle: 'Eliminar bahía',
    deleteMessage: (name: string) =>
      `¿Seguro que quieres eliminar ${name}? Esta acción no se puede deshacer.`,
    form: {
      createTitle: 'Agregar bahía',
      editTitle: 'Editar bahía',
      subtitle: 'Registra una nueva bahía o actualiza su estado y operario.',
      name: 'Nombre de la bahía',
      namePlaceholder: 'Ej. Bahía 5',
      status: 'Estado',
      operator: 'Operario asignado',
      create: 'Crear',
      save: 'Guardar cambios',
      errors: {
        name: 'Ingresa el nombre (mínimo 2 caracteres)',
        duplicate: 'Ya existe una bahía con ese nombre',
      },
    },
    history: {
      added: 'Bahía agregada',
      updated: 'Bahía actualizada',
      statusChanged: 'Estado de bahía actualizado',
      deleted: 'Bahía eliminada',
    },
  },

  // ---------------- Historial ----------------
  historyModal: {
    title: 'Historial de cambios',
    subtitle: 'Últimas modificaciones al horario del negocio',
    empty: 'Aún no hay cambios registrados',
    weekUpdated: 'Horario semanal actualizado',
  },
};
