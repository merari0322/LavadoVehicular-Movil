/// <reference types="jest" />
import { INITIAL_NOTIFICATION_PREFERENCES, NOTIFICATION_PREFERENCE_KEYS } from './settings';

// i18n guarda el idioma en AsyncStorage; en las pruebas va el mock de la librería
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('preferencias de notificación por defecto (MOV-12)', () => {
  it('arrancan todas encendidas, como en security-service, mientras llegan las de la cuenta', () => {
    expect(NOTIFICATION_PREFERENCE_KEYS.every((key) => INITIAL_NOTIFICATION_PREFERENCES[key])).toBe(true);
  });
});
