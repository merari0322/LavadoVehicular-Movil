import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { API_BASE_URL } from '../../core/api/config';
import { siteUrlOf } from '../../core/services/appUpdates/publishedApk';
import { mainRole } from '../../core/navigation/mainRole';
import { navigationRef, whenNavigationReady } from '../../core/navigation/navigationRef';
import { onBeforeSignOut, useSession } from '../../core/services/auth';
import { deviceService } from '../../core/services/notifications/DeviceService';
import { inboxEvents } from '../../core/services/notifications/inboxEvents';
import { NotificationCategory, notificationService } from '../../core/services/notifications/NotificationService';
import {
  createNotificationCommandFactory,
  expoPushGateway,
  notificationInvoker,
  pushTokenStorage,
} from '../../core/services/notifications/push';

const CATEGORIES: NotificationCategory[] = ['REMINDER', 'PROMOTION', 'CONFIRMATION', 'CANCELLATION', 'MESSAGE', 'SYSTEM'];

/**
 * Conecta las push del celular con la sesión. No pinta nada.
 * - al iniciar sesión (o abrir la app con sesión) registra el celular en notification-service;
 * - al cerrar sesión lo quita, antes de borrar el token de acceso;
 * - si llega una push con la app abierta, recarga la bandeja;
 * - si se toca una push (también con la app cerrada), la marca leída y abre su pantalla.
 * Cada acción es un comando (patrón Command) que ejecuta un único invocador en orden.
 */
export function PushNotificationsSync() {
  const { status, user } = useSession();
  const { t, i18n } = useTranslation();
  const role = user ? mainRole(user.roles) : null;

  const factory = useMemo(
    () =>
      createNotificationCommandFactory({
        gateway: expoPushGateway,
        devices: deviceService,
        tokens: pushTokenStorage,
        inbox: notificationService,
        signals: inboxEvents,
        opener: { openUrl: (url) => Linking.openURL(url) },
        // misma dirección fija que el botón de la web
        appDownloadUrl: `${siteUrlOf(API_BASE_URL)}/app/LavaRapidoVehicular.apk`,
        navigator: {
          async navigate(route) {
            if (await whenNavigationReady()) {
              // cada rol solo tiene registradas sus pantallas: la ruta ya viene elegida por rol
              (navigationRef.navigate as (screen: string) => void)(route.screen);
            }
          },
        },
      }),
    [],
  );

  // registrar el celular con esta cuenta (y renombrar los canales de Android si cambió el idioma)
  useEffect(() => {
    if (status !== 'signedIn' || !user) return;
    const names = Object.fromEntries(CATEGORIES.map((c) => [c, t(`PUSH_CHANNELS.${c}`)])) as Record<
      NotificationCategory,
      string
    >;
    void notificationInvoker.run(factory.registerDevice(names));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user?.id, i18n.language, factory]);

  // quitar el celular al cerrar sesión, mientras el token de acceso sigue vigente
  useEffect(() => onBeforeSignOut(() => notificationInvoker.run(factory.unregisterDevice())), [factory]);

  // escuchar las push solo con sesión: así una push vieja de otra cuenta no abre nada
  useEffect(() => {
    if (status !== 'signedIn' || !role || !expoPushGateway.support().supported) return undefined;
    const stopReceived = expoPushGateway.onReceived((payload) => {
      void notificationInvoker.run(factory.received(payload));
    });
    const stopTapped = expoPushGateway.onTapped((payload) => {
      void notificationInvoker.run(factory.tapped(payload, role));
    });
    // la push que abrió la app estando cerrada
    void expoPushGateway.consumeLaunchTap().then((payload) => {
      if (payload) void notificationInvoker.run(factory.tapped(payload, role));
    });
    return () => {
      stopReceived();
      stopTapped();
    };
  }, [status, role, factory]);

  return null;
}
