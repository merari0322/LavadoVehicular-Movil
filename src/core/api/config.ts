import { Platform } from 'react-native';

// dirección del backend. En el celular NO existe "localhost" del computador: hay que usar la IP
// del computador en la red (ej. http://192.168.1.10:3001/api/v1). Se configura en el archivo
// .env con EXPO_PUBLIC_API_URL (ver .env.example). Si no está, se usa un valor por plataforma:
// - emulador de Android: 10.0.2.2 es el "localhost" del computador
// - web / simulador de iOS: localhost funciona directo
const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:3001/api/v1',
  default: 'http://localhost:3001/api/v1',
});

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');

// customer-service (vehículos del cliente) corre en el puerto 3002 del mismo computador.
// Si no se configura EXPO_PUBLIC_CUSTOMER_API_URL, se usa la misma IP cambiando el puerto.
export const CUSTOMER_API_URL = (
  process.env.EXPO_PUBLIC_CUSTOMER_API_URL ?? API_BASE_URL.replace(/:3001(?=\/|$)/, ':3002')
).replace(/\/+$/, '');

// tiempo máximo de espera de una petición antes de dar "sin conexión"
export const REQUEST_TIMEOUT_MS = 15000;
