import Constants from 'expo-constants';
import { Platform } from 'react-native';

// dirección del backend: el API Gateway (puerto 8080), que enruta cada /api/v1/... a su
// microservicio (security, customer, booking, operations, payment y notification), igual que la web.
// En el celular NO existe "localhost" del computador: hay que usar la IP del computador en la red.
// Se elige en este orden:
// 1. EXPO_PUBLIC_API_URL del archivo .env (si se quiere fijar una dirección a mano)
// 2. la IP del computador que corre Expo (la misma con la que el celular descargó la app), así
//    no hay que cambiarla cada vez que cambia la red
// 3. un valor por plataforma: 10.0.2.2 en el emulador de Android, localhost en web / iOS
const GATEWAY_PORT = 8080;

const DEFAULT_API_URL = Platform.select({
  android: `http://10.0.2.2:${GATEWAY_PORT}/api/v1`,
  default: `http://localhost:${GATEWAY_PORT}/api/v1`,
});

// hostUri llega como "10.3.235.56:8081" (IP del computador : puerto de Expo). Solo se usa si es
// una IP de la red: en web o en un build no viene, con localhost no sirve desde el celular y en
// modo túnel (--tunnel) es un dominio de Expo donde el gateway no está
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

function expoHostApiUrl(): string | undefined {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (!host || !IPV4.test(host) || host === '127.0.0.1') {
    return undefined;
  }
  return `http://${host}:${GATEWAY_PORT}/api/v1`;
}

const clean = (url: string) => url.replace(/\/+$/, '');

export const API_BASE_URL = clean(process.env.EXPO_PUBLIC_API_URL || expoHostApiUrl() || DEFAULT_API_URL);

// cada servicio sale por el gateway. Las variables EXPO_PUBLIC_*_API_URL solo sirven para
// apuntar a un microservicio directo mientras se depura (ej. http://<ip>:3003/api/v1).
export const CUSTOMER_API_URL = clean(process.env.EXPO_PUBLIC_CUSTOMER_API_URL ?? API_BASE_URL);
export const BOOKING_API_URL = clean(process.env.EXPO_PUBLIC_BOOKING_API_URL ?? API_BASE_URL);
export const OPERATIONS_API_URL = clean(process.env.EXPO_PUBLIC_OPERATIONS_API_URL ?? API_BASE_URL);
export const PAYMENT_API_URL = clean(process.env.EXPO_PUBLIC_PAYMENT_API_URL ?? API_BASE_URL);
export const NOTIFICATION_API_URL = clean(process.env.EXPO_PUBLIC_NOTIFICATION_API_URL ?? API_BASE_URL);

// MOV-08: un build de producción (sin __DEV__) tiene que hablar con el servidor por https. Si le falta
// EXPO_PUBLIC_API_URL caería en el emulador (http://10.0.2.2) y solo diría "sin conexión": es mejor
// que falle al abrir con un mensaje que diga qué revisar
const LOCAL_HOST = /\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)([:/]|$)/i;

export function assertReleaseApiUrls(urls: string[], isDev: boolean): void {
  if (isDev) return;
  const wrong = urls.find((url) => !/^https:\/\//i.test(url) || LOCAL_HOST.test(url));
  if (wrong) {
    throw new Error(
      `Dirección del backend no válida para un build de producción: ${wrong}. ` +
        'Debe ser https y pública: revisa EXPO_PUBLIC_API_URL en build.<perfil>.env de eas.json.',
    );
  }
}

assertReleaseApiUrls(
  [API_BASE_URL, CUSTOMER_API_URL, BOOKING_API_URL, OPERATIONS_API_URL, PAYMENT_API_URL, NOTIFICATION_API_URL],
  __DEV__,
);

// dirección de la web, para los enlaces públicos (ej. el reporte de inspección: /report/{token}).
// EXPO_PUBLIC_WEB_URL la fija a mano; si no, es el mismo equipo del gateway con el puerto de la web
const WEB_PORT = 4200;
export const WEB_URL = clean(
  process.env.EXPO_PUBLIC_WEB_URL ||
    API_BASE_URL.replace(/\/api\/v1$/, '').replace(new RegExp(`:${GATEWAY_PORT}$`), `:${WEB_PORT}`),
);

// tiempo máximo de espera de una petición antes de dar "sin conexión"
export const REQUEST_TIMEOUT_MS = 15000;
