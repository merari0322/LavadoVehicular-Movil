import { MaterialIcons } from '@expo/vector-icons';

// notificación de cliente y operario (mismo modelo que la web: shared/dialogs/notification-models)
export type NotificationType = 'recordatorio' | 'promocion' | 'confirmacion' | 'cancelacion' | 'mensaje' | 'sistema';

export interface RoleNotification {
  id: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  type: NotificationType;
  // llaves de traducción
  title: string;
  desc: string;
  date: string; // aaaa-mm-dd
  time: string; // HH:mm
  read: boolean;
}

// pestañas: las de "otras" agrupan cancelación, mensaje y sistema
export type NotificationTab = 'all' | 'recordatorio' | 'promocion' | 'confirmacion' | 'others';

export function tabForType(type: NotificationType): NotificationTab {
  if (type === 'recordatorio' || type === 'promocion' || type === 'confirmacion') return type;
  return 'others';
}
