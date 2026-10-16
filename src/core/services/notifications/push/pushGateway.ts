import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type * as ExpoNotifications from 'expo-notifications';

import { NotificationCategory } from '../NotificationService';
import { PushPayload } from './pushPayload';

// adaptador de expo-notifications: es el ÚNICO archivo que habla con la librería. Los comandos
// dependen de esta interfaz (DIP), así se pueden probar o cambiar de proveedor sin tocarlos.

export type PushSupport =
  | { supported: true }
  | { supported: false; reason: 'web' | 'simulator' | 'expo-go' | 'no-project-id' };

export type PermissionResult = 'granted' | 'denied';

export interface PushGateway {
  support(): PushSupport;
  requestPermission(): Promise<PermissionResult>;
  // canales de Android: uno por categoría del backend (el backend manda channelId = categoría)
  ensureChannels(names: Record<NotificationCategory, string>): Promise<void>;
  getToken(): Promise<string>;
  platform(): 'ANDROID' | 'IOS';
  onReceived(listener: (payload: PushPayload) => void): () => void;
  onTapped(listener: (payload: PushPayload) => void): () => void;
  // la push que abrió la app estando cerrada (se consume una sola vez)
  consumeLaunchTap(): Promise<PushPayload | null>;
  setBadge(count: number): Promise<void>;
}

// la librería se carga solo si el celular puede recibir push: en Expo Go (Android) y en web
// las push remotas no existen y cargarla solo llena la consola de advertencias
let module: typeof ExpoNotifications | null = null;
function notifications(): typeof ExpoNotifications {
  if (!module) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    module = require('expo-notifications') as typeof ExpoNotifications;
  }
  return module;
}

// id del proyecto de EAS: Expo lo exige para entregar el token. Sale de app.json
// (extra.eas.projectId, lo escribe `eas init`) o de EXPO_PUBLIC_EAS_PROJECT_ID
function projectId(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ||
    Constants.easConfig?.projectId ||
    undefined
  );
}

const CHANNEL_IDS: Record<NotificationCategory, string> = {
  REMINDER: 'reminder',
  PROMOTION: 'promotion',
  CONFIRMATION: 'confirmation',
  CANCELLATION: 'cancellation',
  MESSAGE: 'message',
  SYSTEM: 'system',
};

function toPayload(content: ExpoNotifications.NotificationContent): PushPayload {
  return PushPayload.from(content.data as Record<string, unknown> | null, content.title, content.body);
}

let handlerInstalled = false;

export const expoPushGateway: PushGateway = {
  support() {
    if (Platform.OS === 'web') return { supported: false, reason: 'web' };
    if (!Device.isDevice) return { supported: false, reason: 'simulator' };
    // desde el SDK 53, Expo Go en Android ya no recibe push remotas: hace falta un build de desarrollo
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient && Platform.OS === 'android') {
      return { supported: false, reason: 'expo-go' };
    }
    if (!projectId()) return { supported: false, reason: 'no-project-id' };
    return { supported: true };
  },

  async requestPermission() {
    const api = notifications();
    if (!handlerInstalled) {
      // con la app abierta la push también se muestra como aviso (y suena)
      api.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
      handlerInstalled = true;
    }
    const current = await api.getPermissionsAsync();
    if (current.granted) return 'granted';
    if (!current.canAskAgain) return 'denied';
    const asked = await api.requestPermissionsAsync();
    return asked.granted ? 'granted' : 'denied';
  },

  async ensureChannels(names) {
    if (Platform.OS !== 'android') return;
    const api = notifications();
    // crear un canal que ya existe solo le actualiza el nombre (ej. si cambió el idioma)
    await Promise.all(
      (Object.keys(CHANNEL_IDS) as NotificationCategory[]).map((category) =>
        api.setNotificationChannelAsync(CHANNEL_IDS[category], {
          name: names[category],
          importance:
            category === 'PROMOTION' ? api.AndroidImportance.DEFAULT : api.AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2ec4b6',
        }),
      ),
    );
  },

  async getToken() {
    const { data } = await notifications().getExpoPushTokenAsync({ projectId: projectId() });
    return data;
  },

  platform() {
    return Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
  },

  onReceived(listener) {
    const subscription = notifications().addNotificationReceivedListener((n) => listener(toPayload(n.request.content)));
    return () => subscription.remove();
  },

  onTapped(listener) {
    const subscription = notifications().addNotificationResponseReceivedListener((response) =>
      listener(toPayload(response.notification.request.content)),
    );
    return () => subscription.remove();
  },

  async consumeLaunchTap() {
    const api = notifications();
    const response = await api.getLastNotificationResponseAsync();
    if (!response) return null;
    await api.clearLastNotificationResponseAsync();
    return toPayload(response.notification.request.content);
  },

  async setBadge(count) {
    await notifications().setBadgeCountAsync(Math.max(count, 0));
  },
};
