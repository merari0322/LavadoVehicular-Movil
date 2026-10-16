import { NotificationCommand } from './NotificationCommand';
import { DeviceApi, TokenStore } from './RegisterDeviceCommand';

// al cerrar sesión (antes de borrar el token de acceso): el celular deja de recibir las push de
// esta cuenta. El token guardado se borra aunque el servidor no responda; si quedó activo allá,
// el próximo inicio de sesión lo pasa a la cuenta nueva.
export class UnregisterDeviceCommand implements NotificationCommand {
  readonly name = 'UnregisterDevice';

  constructor(
    private readonly devices: DeviceApi,
    private readonly tokens: TokenStore,
  ) {}

  async execute(): Promise<void> {
    const token = await this.tokens.load();
    if (!token) return;
    try {
      await this.devices.unregister(token);
    } finally {
      await this.tokens.clear();
    }
  }
}
