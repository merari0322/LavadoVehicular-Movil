import { AppNotification } from '../models/notifications';

// Datos de ejemplo de notificaciones (TODO: reemplazar por datos de la API)
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'not-1',
    category: 'reminder',
    title: 'Nuevo servicio asignado',
    message: 'SV-2034 te ha sido asignado para las 3:00 p.m.',
    createdAt: '2026-09-19T08:40',
    read: false,
  },
  {
    id: 'not-2',
    category: 'confirmation',
    title: 'Actualización de estado',
    message: 'El cliente confirmó su reserva para el servicio SV-1783.',
    createdAt: '2026-09-18T16:05',
    read: true,
  },
  {
    id: 'not-3',
    category: 'other',
    title: 'Sistema',
    message: 'Tu perfil ha sido actualizado correctamente.',
    createdAt: '2026-09-17T09:00',
    read: true,
  },
  {
    id: 'not-4',
    category: 'promotion',
    title: 'Nueva promoción activa',
    message: 'La promoción "Lavado + encerado" ya está disponible para los clientes.',
    createdAt: '2026-09-16T11:20',
    read: true,
  },
];
