import { NotificationRoute } from '../notificationRoutes';
import { NotificationCommand } from './NotificationCommand';

export interface RouteNavigator {
  // espera a que la navegación esté lista (la app pudo abrirse desde la push)
  navigate(route: NotificationRoute): Promise<void>;
}

// abre la pantalla que corresponde a la push tocada (la reserva, el pago, la bandeja...)
export class OpenNotificationCommand implements NotificationCommand {
  readonly name: string;

  constructor(
    private readonly navigator: RouteNavigator,
    private readonly route: NotificationRoute,
  ) {
    this.name = `Open(${route.screen})`;
  }

  async execute(): Promise<void> {
    await this.navigator.navigate(this.route);
  }
}
