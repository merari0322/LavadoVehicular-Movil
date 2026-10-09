import { request } from '../../api/httpClient';

// preferencias de la cuenta (security-service, /users/me/preferences). Cada correo tiene las
// suyas: al entrar con otra cuenta en el mismo celular se aplican las de esa cuenta.
// El PUT es un cambio parcial: lo que no se manda se queda como estaba, así la apariencia y los
// interruptores de notificaciones se guardan por separado sin pisarse.

export interface AccountPreferences {
  theme: string; // green-light | green-dark | pink | pink-dark
  language: string; // es | en | fr | pt
  notificationsEnabled: boolean; // notificaciones push
  emailRemindersEnabled: boolean; // correo de los recordatorios de reserva
  promotionsEnabled: boolean; // promociones (cupones desbloqueados)
}

// interruptores de Configuración > Notificaciones; notification-service los respeta al enviar
export interface NotificationChannels {
  push: boolean;
  email: boolean;
  promo: boolean;
}

export const toNotificationChannels = (prefs: AccountPreferences): NotificationChannels => ({
  push: prefs.notificationsEnabled,
  email: prefs.emailRemindersEnabled,
  promo: prefs.promotionsEnabled,
});

export const preferencesService = {
  get(): Promise<AccountPreferences> {
    return request<AccountPreferences>('GET', '/users/me/preferences');
  },

  // tema e idioma (no toca los interruptores)
  saveInterface(theme: string, language: string): Promise<AccountPreferences> {
    return request<AccountPreferences>('PUT', '/users/me/preferences', { body: { theme, language } });
  },

  // interruptores de notificaciones (no toca el tema ni el idioma)
  saveNotificationChannels(channels: NotificationChannels): Promise<AccountPreferences> {
    return request<AccountPreferences>('PUT', '/users/me/preferences', {
      body: {
        notificationsEnabled: channels.push,
        emailRemindersEnabled: channels.email,
        promotionsEnabled: channels.promo,
      },
    });
  },
};
