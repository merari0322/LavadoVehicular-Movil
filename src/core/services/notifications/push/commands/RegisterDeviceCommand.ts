import { NotificationCategory } from '../../NotificationService';
import { PushGateway } from '../pushGateway';
import { NotificationCommand } from './NotificationCommand';

export interface DeviceApi {
  register(token: string, platform: 'ANDROID' | 'IOS'): Promise<unknown>;
  unregister(token: string): Promise<void>;
}

export interface TokenStore {
  load(): Promise<string | null>;
  save(token: string): Promise<void>;
  clear(): Promise<void>;
}

// al iniciar sesión: pide permiso, crea los canales de Android, saca el token de Expo y lo
// registra en notification-service para que las push de esta cuenta lleguen a este celular.
// Si el celular no puede recibir push (web, emulador, Expo Go) o el usuario no da permiso, no
// hace nada: la bandeja de la app sigue funcionando igual.
export class RegisterDeviceCommand implements NotificationCommand {
  readonly name = 'RegisterDevice';

  constructor(
    private readonly gateway: PushGateway,
    private readonly devices: DeviceApi,
    private readonly tokens: TokenStore,
    private readonly channelNames: Record<NotificationCategory, string>,
  ) {}

  async execute(): Promise<void> {
    const support = this.gateway.support();
    if (!support.supported) {
      if (__DEV__) console.info(`[push] este celular no recibe push (${support.reason})`);
      return;
    }
    if ((await this.gateway.requestPermission()) !== 'granted') {
      if (__DEV__) console.info('[push] el usuario no dio permiso de notificaciones');
      return;
    }
    await this.gateway.ensureChannels(this.channelNames);
    const token = await this.gateway.getToken();
    // se registra en cada inicio de sesión: es idempotente y le pasa el celular a la cuenta que entró
    await this.devices.register(token, this.gateway.platform());
    await this.tokens.save(token);
  }
}
