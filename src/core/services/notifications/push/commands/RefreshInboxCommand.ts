import { NotificationCommand } from './NotificationCommand';

export interface InboxApi {
  unreadCount(): Promise<number>;
}

export interface InboxSignals {
  emitChanged(): void;
}

export interface BadgeSetter {
  setBadge(count: number): Promise<void>;
}

// la bandeja cambió: las pantallas abiertas recargan y el número del ícono de la app se ajusta
// a las no leídas que dice el backend (la app no las cuenta por su cuenta)
export class RefreshInboxCommand implements NotificationCommand {
  readonly name = 'RefreshInbox';

  constructor(
    private readonly api: InboxApi,
    private readonly signals: InboxSignals,
    private readonly badge: BadgeSetter | null,
  ) {}

  async execute(): Promise<void> {
    this.signals.emitChanged();
    if (this.badge) {
      await this.badge.setBadge(await this.api.unreadCount());
    }
  }
}
