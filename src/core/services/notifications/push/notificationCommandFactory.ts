import type { UserRole } from '../../auth';
import { NotificationCategory } from '../NotificationService';
import { CompositeCommand, NotificationCommand } from './commands/NotificationCommand';
import { MarkNotificationReadCommand, ReadApi } from './commands/MarkNotificationReadCommand';
import { OpenDownloadCommand, UrlOpener } from './commands/OpenDownloadCommand';
import { OpenNotificationCommand, RouteNavigator } from './commands/OpenNotificationCommand';
import { BadgeSetter, InboxApi, InboxSignals, RefreshInboxCommand } from './commands/RefreshInboxCommand';
import { DeviceApi, RegisterDeviceCommand, TokenStore } from './commands/RegisterDeviceCommand';
import { UnregisterDeviceCommand } from './commands/UnregisterDeviceCommand';
import { routeForNotification } from './notificationRoutes';
import { PushGateway } from './pushGateway';
import { PushPayload } from './pushPayload';

export interface NotificationCommandDeps {
  gateway: PushGateway;
  devices: DeviceApi;
  tokens: TokenStore;
  inbox: InboxApi & ReadApi;
  signals: InboxSignals;
  navigator: RouteNavigator;
  // push de "versión nueva de la app": se abre la descarga del APK en vez de una pantalla
  opener: UrlOpener;
  appDownloadUrl: string;
}

// tipo del aviso de versión nueva (notification-service, APP_UPDATE_AVAILABLE)
const APP_UPDATE_TYPE = 'APP_UPDATE_AVAILABLE';

// fábrica de comandos: traduce cada cosa que pasa con las push (iniciar o cerrar sesión, llega
// una push, el usuario la toca) en el comando que hay que ejecutar. No ejecuta nada.
export function createNotificationCommandFactory(deps: NotificationCommandDeps) {
  const badge: BadgeSetter | null = deps.gateway.support().supported ? deps.gateway : null;
  const refresh = () => new RefreshInboxCommand(deps.inbox, deps.signals, badge);

  return {
    registerDevice(channelNames: Record<NotificationCategory, string>): NotificationCommand {
      return new RegisterDeviceCommand(deps.gateway, deps.devices, deps.tokens, channelNames);
    },

    unregisterDevice(): NotificationCommand {
      return new UnregisterDeviceCommand(deps.devices, deps.tokens);
    },

    // llegó una push con la app abierta: el aviso lo muestra el sistema, aquí solo se recarga
    received(_payload: PushPayload): NotificationCommand {
      return refresh();
    },

    // tocó una push: queda leída, se abre su pantalla (o la descarga, si es una versión nueva de la
    // app) y la bandeja se recarga
    tapped(payload: PushPayload, role: UserRole): NotificationCommand {
      const commands: NotificationCommand[] = [];
      if (payload.notificationId) {
        commands.push(new MarkNotificationReadCommand(deps.inbox, payload.notificationId));
      }
      commands.push(
        payload.type === APP_UPDATE_TYPE
          ? new OpenDownloadCommand(deps.opener, deps.appDownloadUrl)
          : new OpenNotificationCommand(deps.navigator, routeForNotification(role, payload.type)),
      );
      commands.push(refresh());
      return new CompositeCommand(commands);
    },
  };
}

export type NotificationCommandFactory = ReturnType<typeof createNotificationCommandFactory>;
