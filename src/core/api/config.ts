import { Platform } from 'react-native';

// dirección del backend: el API Gateway (puerto 8080), que enruta cada /api/v1/... a su
// microservicio (security, customer, booking, operations, payment y notification), igual que la web.
// En el celular NO existe "localhost" del computador: hay que usar la IP del computador en la red
// (ej. http://192.168.1.10:8080/api/v1). Se configura en el archivo .env con EXPO_PUBLIC_API_URL
// (ver .env.example). Si no está, se usa un valor por plataforma:
// - emulador de Android: 10.0.2.2 es el "localhost" del computador
// - web / simulador de iOS: localhost funciona directo
const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:8080/api/v1',
  default: 'http://localhost:8080/api/v1',
});

const clean = (url: string) => url.replace(/\/+$/, '');

export const API_BASE_URL = clean(process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL);

// cada servicio sale por el gateway. Las variables EXPO_PUBLIC_*_API_URL solo sirven para
// apuntar a un microservicio directo mientras se depura (ej. http://<ip>:3003/api/v1).
export const CUSTOMER_API_URL = clean(process.env.EXPO_PUBLIC_CUSTOMER_API_URL ?? API_BASE_URL);
export const BOOKING_API_URL = clean(process.env.EXPO_PUBLIC_BOOKING_API_URL ?? API_BASE_URL);
export const OPERATIONS_API_URL = clean(process.env.EXPO_PUBLIC_OPERATIONS_API_URL ?? API_BASE_URL);
export const PAYMENT_API_URL = clean(process.env.EXPO_PUBLIC_PAYMENT_API_URL ?? API_BASE_URL);
export const NOTIFICATION_API_URL = clean(process.env.EXPO_PUBLIC_NOTIFICATION_API_URL ?? API_BASE_URL);

// tiempo máximo de espera de una petición antes de dar "sin conexión"
export const REQUEST_TIMEOUT_MS = 15000;
