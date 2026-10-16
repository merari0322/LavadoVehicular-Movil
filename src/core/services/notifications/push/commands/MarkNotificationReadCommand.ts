import { NotificationCommand } from './NotificationCommand';

export interface ReadApi {
  markRead(id: number): Promise<unknown>;
}

// al tocar una push, esa notificación queda leída en la bandeja (igual que abrirla en la app)
export class MarkNotificationReadCommand implements NotificationCommand {
  readonly name = 'MarkRead';

  constructor(
    private readonly api: ReadApi,
    private readonly notificationId: number,
  ) {}

  async execute(): Promise<void> {
    await this.api.markRead(this.notificationId);
  }
}
