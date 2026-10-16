import { NotificationCommand } from './NotificationCommand';

export interface UrlOpener {
  openUrl(url: string): Promise<unknown>;
}

// push de "versión nueva de la app": abre la descarga del APK publicado en el servidor
export class OpenDownloadCommand implements NotificationCommand {
  readonly name = 'OpenDownload';

  constructor(
    private readonly opener: UrlOpener,
    private readonly url: string,
  ) {}

  async execute(): Promise<void> {
    await this.opener.openUrl(this.url);
  }
}
