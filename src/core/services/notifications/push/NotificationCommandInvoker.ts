import { NotificationCommand } from './commands/NotificationCommand';

// invocador del patrón Command: ejecuta los comandos de push de uno en uno, en el orden en que
// llegan. Así "registrar" y "quitar" el celular nunca se cruzan (iniciar y cerrar sesión rápido),
// y un comando que falla no tumba la app: las push son un extra, la bandeja sigue funcionando.
export class NotificationCommandInvoker {
  private queue: Promise<void> = Promise.resolve();

  run(command: NotificationCommand): Promise<void> {
    const next = this.queue.then(() => this.execute(command));
    // la cola sigue aunque este comando falle
    this.queue = next.catch(() => undefined);
    return next;
  }

  private async execute(command: NotificationCommand): Promise<void> {
    try {
      await command.execute();
      if (__DEV__) console.info(`[push] ${command.name} ok`);
    } catch (error) {
      // nunca se escribe el token del celular: basta con el nombre del comando y el error
      if (__DEV__) console.warn(`[push] ${command.name} falló`, error instanceof Error ? error.message : error);
    }
  }
}

// un solo invocador para toda la app (una sola cola)
export const notificationInvoker = new NotificationCommandInvoker();
