import { localized } from '../../../shared/i18n/localized';
import { NotificationCategory, NotificationTab, ReadFilter } from '../models/notifications';

// Textos de la pantalla de notificaciones en los 4 idiomas de la app
const es = {
  title: 'Notificaciones',
  subtitle:
    'Aquí puedes ver las notificaciones administrativas: pagos por verificar, reservas sin operario, novedades del equipo y del sistema.',
  unreadBadge: (total: number) => `${total} sin leer`,
  markAllRead: 'Marcar todo como leído',

  common: {
    cancel: 'Cancelar',
    delete: 'Eliminar',
    close: 'Cerrar',
  },

  tabs: {
    all: 'Todas',
    reminder: 'Recordatorios',
    promotion: 'Promociones',
    confirmation: 'Confirmaciones',
    other: 'Otras',
  } as Record<NotificationTab, string>,

  // Etiqueta de color de cada categoría
  categories: {
    reminder: 'Recordatorio',
    promotion: 'Promoción',
    confirmation: 'Confirmación',
    other: 'Sistema',
  } as Record<NotificationCategory, string>,

  // ---------------- Filtros ----------------
  filters: {
    title: 'Filtros de búsqueda',
    readState: 'Estado de lectura',
    readOptions: {
      all: 'Todas',
      unread: 'No leídas',
      read: 'Leídas',
    } as Record<ReadFilter, string>,
    dateGroup: 'Filtrar por fecha',
    from: 'Desde',
    to: 'Hasta',
    datePlaceholder: 'dd/mm/aaaa',
    reset: 'Restablecer filtros',
    errors: {
      date: 'Fecha inválida (dd/mm/aaaa)',
      range: 'Debe ser posterior a la fecha inicial',
    },
  },

  // ---------------- Lista ----------------
  item: {
    markRead: 'Marcar leído',
    markUnread: 'Marcar no leído',
    viewDetail: 'Ver detalle',
  },
  empty: 'No hay notificaciones',
  emptyHint: 'Cuando haya novedades aparecerán aquí',
  emptyFilteredHint: 'Prueba cambiando los filtros de búsqueda',

  deleteTitle: 'Eliminar notificación',
  deleteMessage: (title: string) =>
    `¿Seguro que quieres eliminar la notificación "${title}"? Esta acción no se puede deshacer.`,

  // ---------------- Detalle ----------------
  detail: {
    read: 'Leído',
    unread: 'No leído',
  },
};

const en: typeof es = {
  title: 'Notifications',
  subtitle:
    'Here you can see administrative notifications: payments to verify, bookings without an operator, team and system news.',
  unreadBadge: (total: number) => `${total} unread`,
  markAllRead: 'Mark all as read',
  common: { cancel: 'Cancel', delete: 'Delete', close: 'Close' },
  tabs: { all: 'All', reminder: 'Reminders', promotion: 'Promotions', confirmation: 'Confirmations', other: 'Others' },
  categories: { reminder: 'Reminder', promotion: 'Promotion', confirmation: 'Confirmation', other: 'System' },
  filters: {
    title: 'Search filters',
    readState: 'Read status',
    readOptions: { all: 'All', unread: 'Unread', read: 'Read' },
    dateGroup: 'Filter by date',
    from: 'From',
    to: 'To',
    datePlaceholder: 'dd/mm/yyyy',
    reset: 'Reset filters',
    errors: { date: 'Invalid date (dd/mm/yyyy)', range: 'Must be after the start date' },
  },
  item: { markRead: 'Mark as read', markUnread: 'Mark as unread', viewDetail: 'View detail' },
  empty: 'No notifications',
  emptyHint: 'New updates will appear here',
  emptyFilteredHint: 'Try changing the search filters',
  deleteTitle: 'Delete notification',
  deleteMessage: (title: string) => `Are you sure you want to delete the notification "${title}"? This action cannot be undone.`,
  detail: { read: 'Read', unread: 'Unread' },
};

const fr: typeof es = {
  title: 'Notifications',
  subtitle:
    'Ici, vous voyez les notifications administratives : paiements à vérifier, réservations sans opérateur, nouvelles de l’équipe et du système.',
  unreadBadge: (total: number) => `${total} non lues`,
  markAllRead: 'Tout marquer comme lu',
  common: { cancel: 'Annuler', delete: 'Supprimer', close: 'Fermer' },
  tabs: { all: 'Toutes', reminder: 'Rappels', promotion: 'Promotions', confirmation: 'Confirmations', other: 'Autres' },
  categories: { reminder: 'Rappel', promotion: 'Promotion', confirmation: 'Confirmation', other: 'Système' },
  filters: {
    title: 'Filtres de recherche',
    readState: 'État de lecture',
    readOptions: { all: 'Toutes', unread: 'Non lues', read: 'Lues' },
    dateGroup: 'Filtrer par date',
    from: 'Du',
    to: 'Au',
    datePlaceholder: 'jj/mm/aaaa',
    reset: 'Réinitialiser les filtres',
    errors: { date: 'Date invalide (jj/mm/aaaa)', range: 'Doit être postérieure à la date de début' },
  },
  item: { markRead: 'Marquer comme lu', markUnread: 'Marquer comme non lu', viewDetail: 'Voir le détail' },
  empty: 'Aucune notification',
  emptyHint: 'Les nouveautés apparaîtront ici',
  emptyFilteredHint: 'Essayez de modifier les filtres de recherche',
  deleteTitle: 'Supprimer la notification',
  deleteMessage: (title: string) => `Voulez-vous vraiment supprimer la notification « ${title} » ? Cette action est irréversible.`,
  detail: { read: 'Lu', unread: 'Non lu' },
};

const pt: typeof es = {
  title: 'Notificações',
  subtitle:
    'Aqui você vê as notificações administrativas: pagamentos a verificar, reservas sem operador, novidades da equipe e do sistema.',
  unreadBadge: (total: number) => `${total} não lidas`,
  markAllRead: 'Marcar tudo como lido',
  common: { cancel: 'Cancelar', delete: 'Excluir', close: 'Fechar' },
  tabs: { all: 'Todas', reminder: 'Lembretes', promotion: 'Promoções', confirmation: 'Confirmações', other: 'Outras' },
  categories: { reminder: 'Lembrete', promotion: 'Promoção', confirmation: 'Confirmação', other: 'Sistema' },
  filters: {
    title: 'Filtros de busca',
    readState: 'Status de leitura',
    readOptions: { all: 'Todas', unread: 'Não lidas', read: 'Lidas' },
    dateGroup: 'Filtrar por data',
    from: 'De',
    to: 'Até',
    datePlaceholder: 'dd/mm/aaaa',
    reset: 'Limpar filtros',
    errors: { date: 'Data inválida (dd/mm/aaaa)', range: 'Deve ser posterior à data inicial' },
  },
  item: { markRead: 'Marcar como lido', markUnread: 'Marcar como não lido', viewDetail: 'Ver detalhe' },
  empty: 'Não há notificações',
  emptyHint: 'As novidades aparecerão aqui',
  emptyFilteredHint: 'Tente mudar os filtros de busca',
  deleteTitle: 'Excluir notificação',
  deleteMessage: (title: string) => `Tem certeza de que deseja excluir a notificação "${title}"? Esta ação não pode ser desfeita.`,
  detail: { read: 'Lido', unread: 'Não lido' },
};

export const NOTIFICATION_TEXTS = localized({ es, en, fr, pt });
