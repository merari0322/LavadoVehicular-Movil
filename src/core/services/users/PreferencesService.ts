import { request } from '../../api/httpClient';

// tema e idioma de la cuenta (security-service, /users/me/preferences). Cada correo tiene
// los suyos: al entrar con otra cuenta en el mismo celular se aplican los de esa cuenta.

export interface AccountPreferences {
  theme: string; // green-light | green-dark | pink | pink-dark
  language: string; // es | en | fr | pt
  notificationsEnabled: boolean;
}

export const preferencesService = {
  get(): Promise<AccountPreferences> {
    return request<AccountPreferences>('GET', '/users/me/preferences');
  },

  save(preferences: AccountPreferences): Promise<AccountPreferences> {
    return request<AccountPreferences>('PUT', '/users/me/preferences', { body: preferences });
  },
};
