// Modelos y tipos del módulo de notificaciones

export type NotificationCategory = 'reminder' | 'promotion' | 'confirmation' | 'other';

// Pestañas: "all" muestra todas las categorías
export type NotificationTab = 'all' | NotificationCategory;
export const NOTIFICATION_TABS: NotificationTab[] = [
  'all',
  'reminder',
  'promotion',
  'confirmation',
  'other',
];

export type ReadFilter = 'all' | 'unread' | 'read';
export const READ_FILTERS: ReadFilter[] = ['all', 'unread', 'read'];

// Se llama AppNotification para no chocar con el tipo global Notification del navegador
export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string; // Formato ISO: YYYY-MM-DDTHH:mm
  read: boolean;
}

// Filtros de búsqueda (las fechas se guardan como se escriben: dd/mm/aaaa)
export interface NotificationFilters {
  readState: ReadFilter;
  dateFrom: string;
  dateTo: string;
}
