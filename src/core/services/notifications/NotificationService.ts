import { MaterialIcons } from '@expo/vector-icons';

import { NOTIFICATION_API_URL } from '../../api/config';
import { request } from '../../api/httpClient';
import { NotificationType, RoleNotification } from '../../../shared/models/notification';

// bandeja del usuario contra notification-service (mismos endpoints que la web).
// el id del usuario nunca viaja: el backend lo saca del token JWT.

export type NotificationCategory = 'REMINDER' | 'PROMOTION' | 'CONFIRMATION' | 'CANCELLATION' | 'MESSAGE' | 'SYSTEM';

export interface NotificationResponse {
  id: number;
  type: string;
  category: NotificationCategory;
  title: string; // texto ya escrito por el backend
  message: string;
  referenceEntity: string | null;
  referenceId: number | null;
  read: boolean;
  readAt: string | null;
  sentAt: string; // ISO en UTC
}

interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const base = { baseUrl: NOTIFICATION_API_URL };

export const notificationService = {
  async list(): Promise<NotificationResponse[]> {
    const page = await request<PageResponse<NotificationResponse>>('GET', '/notifications', {
      ...base,
      query: { page: 0, size: 100 },
    });
    return page.items;
  },

  async unreadCount(): Promise<number> {
    const response = await request<{ count: number }>('GET', '/notifications/unread-count', base);
    return response.count;
  },

  markRead(id: number): Promise<NotificationResponse> {
    return request<NotificationResponse>('PATCH', `/notifications/${id}/read`, base);
  },

  markUnread(id: number): Promise<NotificationResponse> {
    return request<NotificationResponse>('PATCH', `/notifications/${id}/unread`, base);
  },

  markAllRead(): Promise<{ updated: number }> {
    return request<{ updated: number }>('POST', '/notifications/read-all', base);
  },

  remove(id: number): Promise<void> {
    return request<void>('DELETE', `/notifications/${id}`, base);
  },
};

const TYPE_BY_CATEGORY: Record<NotificationCategory, NotificationType> = {
  REMINDER: 'recordatorio',
  PROMOTION: 'promocion',
  CONFIRMATION: 'confirmacion',
  CANCELLATION: 'cancelacion',
  MESSAGE: 'mensaje',
  SYSTEM: 'sistema',
};

const ICON_BY_TYPE: Record<NotificationType, keyof typeof MaterialIcons.glyphMap> = {
  recordatorio: 'schedule',
  promocion: 'sell',
  confirmacion: 'check-circle',
  cancelacion: 'warning',
  mensaje: 'chat',
  sistema: 'desktop-windows',
};

// fecha y hora local (Colombia) a partir del instante UTC del backend
function localParts(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

// notificación del backend -> modelo que pintan las pantallas (el texto ya viene escrito)
export function toRoleNotification(n: NotificationResponse): RoleNotification {
  const type = TYPE_BY_CATEGORY[n.category] ?? 'sistema';
  return { id: n.id, icon: ICON_BY_TYPE[type], type, title: n.title, desc: n.message, read: n.read, ...localParts(n.sentAt) };
}
