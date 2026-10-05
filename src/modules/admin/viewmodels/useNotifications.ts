import { useCallback, useEffect, useMemo, useState } from 'react';
import { NOTIFICATION_TEXTS } from '../constants/notificationTexts';
import {
  AppNotification,
  NotificationFilters,
  NotificationTab,
} from '../models/notifications';
import {
  NotificationResponse,
  notificationService,
} from '../../../core/services/notifications/NotificationService';
import { getDatePart } from '../utils/notificationUtils';
import { displayToISO } from '../utils/reservationUtils';

// Errores de los campos de fecha del filtro
export interface FilterErrors {
  dateFrom?: string;
  dateTo?: string;
}

const EMPTY_FILTERS: NotificationFilters = { readState: 'all', dateFrom: '', dateTo: '' };

const pad = (n: number) => String(n).padStart(2, '0');

// notificación del backend -> modelo de la pantalla (fecha local "aaaa-mm-ddTHH:mm")
function toAppNotification(n: NotificationResponse): AppNotification {
  const d = new Date(n.sentAt);
  const category: AppNotification['category'] =
    n.category === 'REMINDER' ? 'reminder'
      : n.category === 'PROMOTION' ? 'promotion'
        : n.category === 'CONFIRMATION' ? 'confirmation' : 'other';
  return {
    id: String(n.id),
    category,
    title: n.title,
    message: n.message,
    createdAt: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
    read: n.read,
  };
}

// Hook con el estado y la lógica de la pantalla de notificaciones
export function useNotifications() {
  // bandeja real del admin (notification-service); el id sale del token
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    notificationService
      .list()
      .then((list) => setNotifications(list.map(toAppNotification)))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);
  const [tab, setTab] = useState<NotificationTab>('all');
  const [filters, setFilters] = useState<NotificationFilters>(EMPTY_FILTERS);

  // ---------------------------------------------------------------
  // Filtros
  // ---------------------------------------------------------------

  // Fechas ya convertidas a ISO (vacío = sin filtro) y sus errores
  const { fromISO, toISO, filterErrors } = useMemo(() => {
    const messages = NOTIFICATION_TEXTS.filters.errors;
    const from = displayToISO(filters.dateFrom) || '';
    const to = displayToISO(filters.dateTo) || '';
    const errors: FilterErrors = {};

    // La fecha solo se valida cuando está completa
    if (filters.dateFrom.length === 10 && !from) errors.dateFrom = messages.date;
    if (filters.dateTo.length === 10 && !to) errors.dateTo = messages.date;
    if (from && to && from > to) errors.dateTo = messages.range;

    return { fromISO: from, toISO: to, filterErrors: errors };
  }, [filters.dateFrom, filters.dateTo]);

  const hasActiveFilters =
    filters.readState !== 'all' || filters.dateFrom !== '' || filters.dateTo !== '';

  // Cambia solo los filtros indicados
  const updateFilters = (partial: Partial<NotificationFilters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  // ---------------------------------------------------------------
  // Lista visible
  // ---------------------------------------------------------------

  // Notificaciones de la pestaña y filtros activos, de la más reciente a la más antigua
  const visibleNotifications = useMemo(
    () =>
      notifications
        .filter((item) => {
          if (tab !== 'all' && item.category !== tab) return false;
          if (filters.readState === 'unread' && item.read) return false;
          if (filters.readState === 'read' && !item.read) return false;

          const day = getDatePart(item.createdAt);
          if (fromISO && day < fromISO) return false;
          if (toISO && day > toISO) return false;
          return true;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notifications, tab, filters.readState, fromISO, toISO],
  );

  // Cantidad de notificaciones sin leer por pestaña (la pestaña "all" suma todas)
  const unreadByTab = useMemo(() => {
    const counts: Record<NotificationTab, number> = {
      all: 0,
      reminder: 0,
      promotion: 0,
      confirmation: 0,
      other: 0,
    };

    notifications.forEach((item) => {
      if (item.read) return;
      counts.all += 1;
      counts[item.category] += 1;
    });

    return counts;
  }, [notifications]);

  // ---------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------

  // los cambios se guardan en notification-service y luego se pintan
  const toggleRead = (id: string) => {
    const current = notifications.find((item) => item.id === id);
    if (!current) return;
    const call = current.read ? notificationService.markUnread(Number(id)) : notificationService.markRead(Number(id));
    call
      .then(() =>
        setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item))),
      )
      .catch(() => undefined);
  };

  const markAllRead = () =>
    notificationService
      .markAllRead()
      .then(() => setNotifications((prev) => prev.map((item) => ({ ...item, read: true }))))
      .catch(() => undefined);

  const deleteNotification = (id: string) =>
    notificationService
      .remove(Number(id))
      .then(() => setNotifications((prev) => prev.filter((item) => item.id !== id)))
      .catch(() => undefined);

  return {
    tab,
    setTab,
    filters,
    filterErrors,
    hasActiveFilters,
    updateFilters,
    resetFilters,
    notifications: visibleNotifications,
    unreadByTab,
    toggleRead,
    markAllRead,
    deleteNotification,
    loading,
    reload,
  };
}
