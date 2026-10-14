import { NotificationPreferences } from '../models/settings';

// Valores de arranque de las preferencias mientras useSettings() trae las de la cuenta.

// mismos valores por defecto que security-service mientras responde la cuenta
export const INITIAL_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  push: true,
  emailReminders: true,
  promotions: true,
};


