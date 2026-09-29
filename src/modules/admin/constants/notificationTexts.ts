import { NotificationCategory, NotificationTab, ReadFilter } from '../models/notifications';

// Textos de la pantalla de notificaciones (centralizados para migrarlos fácil a i18n)
export const NOTIFICATION_TEXTS = {
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
