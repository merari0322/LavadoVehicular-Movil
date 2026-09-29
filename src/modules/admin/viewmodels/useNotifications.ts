import { useMemo, useState } from 'react';
import { NOTIFICATION_TEXTS } from '../constants/notificationTexts';
import {
  AppNotification,
  NotificationFilters,
  NotificationTab,
} from '../models/notifications';
import { INITIAL_NOTIFICATIONS } from '../services/notificationMock';
import { getDatePart } from '../utils/notificationUtils';
import { displayToISO } from '../utils/reservationUtils';

// Errores de los campos de fecha del filtro
export interface FilterErrors {
  dateFrom?: string;
  dateTo?: string;
}

const EMPTY_FILTERS: NotificationFilters = { readState: 'all', dateFrom: '', dateTo: '' };

// Hook con el estado y la lógica de la pantalla de notificaciones
export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
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

  // Alterna entre leída y no leída
  const toggleRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item)),
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));

  const deleteNotification = (id: string) =>
    setNotifications((prev) => prev.filter((item) => item.id !== id));

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
  };
}
