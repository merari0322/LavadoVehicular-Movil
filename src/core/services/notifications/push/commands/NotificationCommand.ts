// patrón Command: cada acción de las push (registrar el celular, abrir la pantalla de una push,
// marcarla como leída...) es un objeto con todo lo que necesita para ejecutarse. Quien decide QUÉ
// hacer (notificationCommandFactory) queda separado de quien lo ejecuta (NotificationCommandInvoker).
export interface NotificationCommand {
  // nombre corto para el log de desarrollo
  readonly name: string;
  execute(): Promise<void>;
}

// varios comandos como uno solo (Composite): tocar una push = marcarla leída + abrir su pantalla +
// recargar la bandeja. Se ejecutan en orden; si uno falla, los demás igual corren.
export class CompositeCommand implements NotificationCommand {
  readonly name: string;

  constructor(private readonly commands: NotificationCommand[]) {
    this.name = commands.map((c) => c.name).join('+') || 'Empty';
  }

  async execute(): Promise<void> {
    const errors: unknown[] = [];
    for (const command of this.commands) {
      try {
        await command.execute();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length > 0) {
      throw errors[0];
    }
  }
}
