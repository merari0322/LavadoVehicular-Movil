import { localized } from '../../../shared/i18n/localized';
import { OperatorStatusValue } from '../types/dashboard.types';

// Textos del inicio del administrador en los 4 idiomas de la app
const es = {
  hello: (name: string) => `¡Hola, ${name}!`,
  panel: 'Panel de control general',
  todayBookings: 'Ver reservas de hoy',
  // formato de la fecha de hoy según el idioma
  dateLocale: 'es-CO',

  stats: {
    bookingsToday: 'Reservas de hoy',
    vsYesterday: (total: number) => `↗ +${total} vs ayer`,
    inProgress: 'En progreso',
    activeBays: (total: number) => (total === 1 ? '1 bahía activa' : `${total} bahías activas`),
    pendingPayments: 'Pagos por verificar',
    toReview: 'Por revisar',
    revenueToday: 'Ingresos del día',
  },

  revenue: {
    title: 'Ingresos de los últimos 7 días',
    subtitle: 'Consolidado semanal de cobros realizados y verificados',
    total: 'Total semana',
    busiest: (day: string) => `Mayor afluencia: ${day}`,
    viewReport: 'Ver reporte',
  },

  operators: {
    title: 'Estado de operarios',
    staff: (total: number) => `${total} en plantilla`,
    available: 'Disp.',
    busy: 'Ocup.',
    leave: 'Aus.',
    status: { busy: 'Ocupado', available: 'Disponible', leave: 'Incapacidad' } as Record<OperatorStatusValue, string>,
    manageShifts: 'Gestionar turnos',
  },

  payments: {
    title: 'Pagos pendientes de revisión',
    subtitle: 'Comprobantes enviados para validación',
    badge: (total: number) => `${total} pend.`,
    reference: 'Ref',
    review: 'Revisar',
    empty: 'No hay pagos por revisar',
    viewAll: (total: number) => `Ver los ${total} pagos pendientes`,
  },

  unassigned: {
    title: 'Reservas sin operario',
    subtitle: 'Servicios en espera de asignación',
    badge: (total: number) => `${total} por asignar`,
    upcoming: 'Cita próxima',
    assign: 'Asignar',
    empty: 'Todas las reservas de hoy tienen operario',
    viewAll: 'Ver todas las reservas',
    noBay: 'Sin bahía',
  },
};

const en: typeof es = {
  hello: (name: string) => `Hi, ${name}!`,
  panel: 'General control panel',
  todayBookings: "View today's bookings",
  dateLocale: 'en-US',
  stats: {
    bookingsToday: "Today's bookings",
    vsYesterday: (total: number) => `↗ +${total} vs yesterday`,
    inProgress: 'In progress',
    activeBays: (total: number) => (total === 1 ? '1 active bay' : `${total} active bays`),
    pendingPayments: 'Payments to verify',
    toReview: 'To review',
    revenueToday: "Today's revenue",
  },
  revenue: {
    title: 'Revenue for the last 7 days',
    subtitle: 'Weekly summary of collected and verified payments',
    total: 'Week total',
    busiest: (day: string) => `Busiest day: ${day}`,
    viewReport: 'View report',
  },
  operators: {
    title: 'Operator status',
    staff: (total: number) => `${total} on staff`,
    available: 'Avail.',
    busy: 'Busy',
    leave: 'Abs.',
    status: { busy: 'Busy', available: 'Available', leave: 'On leave' },
    manageShifts: 'Manage shifts',
  },
  payments: {
    title: 'Payments pending review',
    subtitle: 'Receipts sent for validation',
    badge: (total: number) => `${total} pend.`,
    reference: 'Ref',
    review: 'Review',
    empty: 'No payments to review',
    viewAll: (total: number) => `View the ${total} pending payments`,
  },
  unassigned: {
    title: 'Bookings without operator',
    subtitle: 'Services waiting for assignment',
    badge: (total: number) => `${total} to assign`,
    upcoming: 'Upcoming',
    assign: 'Assign',
    empty: "All of today's bookings have an operator",
    viewAll: 'View all bookings',
    noBay: 'No bay',
  },
};

const fr: typeof es = {
  hello: (name: string) => `Bonjour, ${name} !`,
  panel: 'Tableau de bord général',
  todayBookings: "Voir les réservations d'aujourd'hui",
  dateLocale: 'fr-FR',
  stats: {
    bookingsToday: "Réservations d'aujourd'hui",
    vsYesterday: (total: number) => `↗ +${total} vs hier`,
    inProgress: 'En cours',
    activeBays: (total: number) => (total === 1 ? '1 baie active' : `${total} baies actives`),
    pendingPayments: 'Paiements à vérifier',
    toReview: 'À réviser',
    revenueToday: 'Revenus du jour',
  },
  revenue: {
    title: 'Revenus des 7 derniers jours',
    subtitle: 'Synthèse hebdomadaire des encaissements vérifiés',
    total: 'Total semaine',
    busiest: (day: string) => `Plus forte affluence : ${day}`,
    viewReport: 'Voir le rapport',
  },
  operators: {
    title: 'État des opérateurs',
    staff: (total: number) => `${total} dans l'effectif`,
    available: 'Disp.',
    busy: 'Occ.',
    leave: 'Abs.',
    status: { busy: 'Occupé', available: 'Disponible', leave: 'Arrêt maladie' },
    manageShifts: 'Gérer les horaires',
  },
  payments: {
    title: 'Paiements en attente de révision',
    subtitle: 'Justificatifs envoyés pour validation',
    badge: (total: number) => `${total} en att.`,
    reference: 'Réf',
    review: 'Réviser',
    empty: 'Aucun paiement à réviser',
    viewAll: (total: number) => `Voir les ${total} paiements en attente`,
  },
  unassigned: {
    title: 'Réservations sans opérateur',
    subtitle: "Services en attente d'attribution",
    badge: (total: number) => `${total} à assigner`,
    upcoming: 'Rendez-vous proche',
    assign: 'Assigner',
    empty: "Toutes les réservations d'aujourd'hui ont un opérateur",
    viewAll: 'Voir toutes les réservations',
    noBay: 'Sans baie',
  },
};

const pt: typeof es = {
  hello: (name: string) => `Olá, ${name}!`,
  panel: 'Painel de controle geral',
  todayBookings: 'Ver reservas de hoje',
  dateLocale: 'pt-BR',
  stats: {
    bookingsToday: 'Reservas de hoje',
    vsYesterday: (total: number) => `↗ +${total} vs ontem`,
    inProgress: 'Em andamento',
    activeBays: (total: number) => (total === 1 ? '1 baia ativa' : `${total} baias ativas`),
    pendingPayments: 'Pagamentos a verificar',
    toReview: 'A revisar',
    revenueToday: 'Receita do dia',
  },
  revenue: {
    title: 'Receita dos últimos 7 dias',
    subtitle: 'Consolidado semanal de cobranças realizadas e verificadas',
    total: 'Total da semana',
    busiest: (day: string) => `Maior movimento: ${day}`,
    viewReport: 'Ver relatório',
  },
  operators: {
    title: 'Status dos operadores',
    staff: (total: number) => `${total} no quadro`,
    available: 'Disp.',
    busy: 'Ocup.',
    leave: 'Aus.',
    status: { busy: 'Ocupado', available: 'Disponível', leave: 'Licença' },
    manageShifts: 'Gerenciar turnos',
  },
  payments: {
    title: 'Pagamentos pendentes de revisão',
    subtitle: 'Comprovantes enviados para validação',
    badge: (total: number) => `${total} pend.`,
    reference: 'Ref',
    review: 'Revisar',
    empty: 'Não há pagamentos para revisar',
    viewAll: (total: number) => `Ver os ${total} pagamentos pendentes`,
  },
  unassigned: {
    title: 'Reservas sem operador',
    subtitle: 'Serviços aguardando atribuição',
    badge: (total: number) => `${total} a atribuir`,
    upcoming: 'Próximo horário',
    assign: 'Atribuir',
    empty: 'Todas as reservas de hoje têm operador',
    viewAll: 'Ver todas as reservas',
    noBay: 'Sem baia',
  },
};

export const DASHBOARD_TEXTS = localized({ es, en, fr, pt });
