import { NOTIFICATION_API_URL } from '../../api/config';
import { request } from '../../api/httpClient';

// celulares que reciben push (notification-service, /notifications/devices). El usuario sale del
// token JWT: la app solo dice cuál es el token de Expo de este celular.

export interface DeviceResponse {
  id: number;
  platform: 'ANDROID' | 'IOS';
  active: boolean;
  lastSeenAt: string;
}

const base = { baseUrl: NOTIFICATION_API_URL };

export const deviceService = {
  // idempotente: registrar el mismo token otra vez no duplica (y si era de otra cuenta, pasa a esta)
  register(token: string, platform: 'ANDROID' | 'IOS'): Promise<DeviceResponse> {
    return request<DeviceResponse>('PUT', '/notifications/devices', { ...base, body: { token, platform } });
  },

  // al cerrar sesión: el celular deja de recibir push de esta cuenta
  unregister(token: string): Promise<void> {
    return request<void>('POST', '/notifications/devices/unregister', { ...base, body: { token } });
  },
};
