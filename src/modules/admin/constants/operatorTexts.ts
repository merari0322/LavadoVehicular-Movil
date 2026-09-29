import {
  OperatorFilter,
  OperatorStatus,
  ServiceStatus,
  SkillLevel,
} from '../models/operator';

// Textos de la pantalla de operarios (centralizados para migrarlos fácil a i18n)
export const OPERATOR_TEXTS = {
  title: 'Operarios',
  subtitle: 'Gestiona el equipo técnico, sus turnos y su disponibilidad operativa en tiempo real',
  assignShifts: 'Asignar turnos',
  newOperator: 'Nuevo operario',

  common: { cancel: 'Cancelar' },

  // ---------------- Tarjetas de resumen ----------------
  summary: {
    staff: 'Operarios en plantilla',
    staffDetail: (hired: number, interns: number) => `${hired} contratados · ${interns} pasantes`,
    availableToday: 'Disponibles hoy',
    availableDetail: (total: number) => `${total} en turno tarde (14:00 - 22:00)`,
    weeklyServices: 'Servicios de la semana',
    trend: (percent: number) => `${percent >= 0 ? '+' : ''}${percent}% vs semana anterior`,
    rating: 'Calificación promedio',
    ratingBase: (total: number) => `Basado en ${total} reseñas de clientes`,
  },

  // ---------------- Filtros ----------------
  search: 'Buscar por nombre o especialidad...',
  filters: {
    all: 'Todos',
    available: 'Disponibles',
    in_service: 'En servicio',
    absent: 'Ausentes',
  } as Record<OperatorFilter, string>,
  empty: 'No se encontraron operarios',
  emptyHint: 'Prueba cambiando la búsqueda o el filtro',

  status: {
    available: 'Disponible',
    in_service: 'En servicio',
    absent: 'Permiso médico',
  } as Record<OperatorStatus, string>,

  // ---------------- Tarjeta de operario ----------------
  card: {
    rating: 'Calificación clientes',
    noRating: 'Sin calificaciones',
    bay: 'Bahía asignada',
    noBay: 'Sin asignar',
    services: (total: number) => `${total} ${total === 1 ? 'servicio' : 'servicios'}`,
    servicesAbsent: (total: number, reason: string) =>
      `${total} ${total === 1 ? 'servicio' : 'servicios'} (${reason})`,
    viewAvailability: 'Ver disponibilidad',
    registerReturn: 'Registrar reingreso',
  },

  // ---------------- Detalle ----------------
  detail: {
    back: 'Volver a Operarios',
    title: (name: string) => `Disponibilidad de ${name}`,
    idLabel: (code: string) => `ID: ${code}`,
    ratingLine: (rating: string, reviews: number) => `${rating} (${reviews} valoraciones)`,
    bayLine: (bay: string) => `Bahía asignada: ${bay}`,
    registerAbsence: 'Registrar ausencia',
    registerReturn: 'Registrar reingreso',
    editAvailability: 'Editar disponibilidad',
    assignBay: 'Asignar bahía / turno',
    absentUntil: (date: string) => `Ausente hasta el ${date}`,
  },

  metrics: {
    services: 'Servicios de la semana',
    servicesUnit: 'servicios',
    hours: 'Horas disponibles',
    hoursOf: (capacity: number) => `/ ${capacity} hrs`,
    occupied: (percent: number) => `${percent}% del cupo operativo ocupado`,
    punctuality: 'Puntualidad',
    punctualityNote: 'Excelente registro de turnos',
    revenue: 'Ingresos generados semana',
    goal: (percent: number) => `${percent}% de meta semanal cumplida`,
  },

  today: {
    title: 'Historial de servicios de hoy',
    assigned: (total: number) => `${total} ${total === 1 ? 'servicio asignado' : 'servicios asignados'}`,
    subtitle: (bay: string) => `Gestión de flujo de trabajo en tiempo real para ${bay}`,
    subtitleNoBay: 'Gestión de flujo de trabajo en tiempo real',
    empty: 'Sin servicios asignados hoy',
    bay: 'Bahía',
    status: {
      completed: 'Completado',
      in_progress: 'En proceso',
      scheduled: 'Agendado',
    } as Record<ServiceStatus, string>,
    action: {
      completed: 'Detalles',
      in_progress: 'Bitácora',
      scheduled: 'Ver orden',
    } as Record<ServiceStatus, string>,
    close: 'Cerrar',
  },

  skills: {
    title: 'Habilidades y certificaciones',
    empty: 'Sin habilidades registradas',
    levels: {
      certified: 'Certificado',
      expert: 'Nivel Experto',
      advanced: 'Avanzado',
    } as Record<SkillLevel, string>,
    ruleTitle: 'Regla operativa de bahías',
    ruleText: (name: string, bay: string) =>
      `Los bloques de servicio asignados a ${name} no pueden solaparse con turnos de mantenimiento general en ${bay}.`,
    ruleTextNoBay: (name: string) =>
      `Los bloques de servicio asignados a ${name} no pueden solaparse con turnos de mantenimiento general.`,
    export: 'Exportar ficha técnica (PDF)',
  },

  // ---------------- Modales ----------------
  form: {
    createTitle: 'Nuevo operario',
    editTitle: 'Editar operario',
    subtitle: 'Registra los datos del operario y su bahía de trabajo.',
    name: 'Nombre completo',
    namePlaceholder: 'Nombre y apellido',
    specialty: 'Especialidad',
    specialtyPlaceholder: 'Ej. Detallado cerámico',
    phone: 'Teléfono',
    phonePlaceholder: '+57 300 000 0000',
    email: 'Correo electrónico',
    emailPlaceholder: 'operario@lavadero.co',
    status: 'Estado',
    bay: 'Bahía',
    noBay: 'Sin bahía asignada',
    bayNotApplicable: 'No aplica: el operario está en permiso médico',
    tags: 'Etiquetas',
    addTag: 'Agregar etiqueta',
    noTags: 'Aún no hay etiquetas.',
    tagPlaceholder: 'Ej. Pulido cerámico',
    save: 'Guardar',
    errors: {
      name: 'Ingresa el nombre completo',
      specialty: 'Ingresa la especialidad',
      phone: 'Ingresa un teléfono válido',
      email: 'El correo no es válido',
    },
  },

  assign: {
    title: 'Asignar turno',
    subtitle: 'Elige el operario, su estado y la bahía del turno.',
    operator: 'Operario',
    status: 'Estado',
    bay: 'Bahía',
    noBay: 'Sin bahía asignada',
    hint: 'La bahía no se puede asignar cuando el operario está en incapacidad.',
    submit: 'Asignar turno',
  },

  availability: {
    title: 'Disponibilidad semanal',
    subtitle: 'Define los horarios en los que el operario atiende servicios.',
    hint: 'Desmarca el día para indicar que el operario no trabaja ese día.',
    start: 'Inicio',
    end: 'Fin',
    error: 'Usa el formato hh:mm y el inicio debe ser antes del fin',
    save: 'Guardar',
  },

  absence: {
    title: 'Registrar incapacidad',
    subtitle: 'Registra el período en que el operario no estará disponible.',
    start: 'Fecha de inicio',
    end: 'Fecha de fin',
    reason: 'Motivo',
    reasonPlaceholder: 'Ej. Incapacidad médica',
    save: 'Guardar',
    errors: {
      date: 'Fecha inválida (dd/mm/aaaa)',
      range: 'La fecha de fin no puede ser anterior al inicio',
    },
  },

  returnDialog: {
    title: 'Registrar reingreso',
    message: (name: string) =>
      `¿Confirmas que ${name} regresa a trabajar? Su estado pasará a Disponible.`,
    confirm: 'Confirmar',
  },
};
