import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// sesión guardada entre aperturas de la app. En Android/iOS el token va cifrado en el llavero
// del sistema (SecureStore); en la versión web no existe llavero y se usa AsyncStorage.
const SESSION_KEY = 'auth_session';

export interface StoredSession {
  accessToken: string;
  expiresAt: string;
  user: unknown;
}

const useSecureStore = Platform.OS !== 'web';

export async function saveSession(session: StoredSession): Promise<void> {
  const value = JSON.stringify(session);
  if (useSecureStore) {
    await SecureStore.setItemAsync(SESSION_KEY, value);
  } else {
    await AsyncStorage.setItem(SESSION_KEY, value);
  }
}

// devuelve la sesión guardada solo si el token todavía no vence
export async function loadSession(): Promise<StoredSession | null> {
  try {
    const value = useSecureStore
      ? await SecureStore.getItemAsync(SESSION_KEY)
      : await AsyncStorage.getItem(SESSION_KEY);
    if (!value) return null;

    const session = JSON.parse(value) as StoredSession;
    return new Date(session.expiresAt).getTime() > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    if (useSecureStore) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // no había nada que borrar
  }
}
