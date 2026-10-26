import AsyncStorage from '@react-native-async-storage/async-storage';

// el último token de Expo que se registró en el backend: al cerrar sesión hay que decirle cuál
// quitar, y así no se vuelve a registrar el mismo en cada arranque
const KEY = 'lavarapido.push.token';

export const pushTokenStorage = {
  async load(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEY);
    } catch {
      return null;
    }
  },

  async save(token: string): Promise<void> {
    await AsyncStorage.setItem(KEY, token).catch(() => undefined);
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(KEY).catch(() => undefined);
  },
};
