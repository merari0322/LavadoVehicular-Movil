import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './types';

// referencia a la navegación para moverse desde fuera de una pantalla (ej. al tocar una push)
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const READY_TIMEOUT_MS = 5000;

// si la app se abrió desde una push, la navegación puede no estar lista todavía: se espera
export function whenNavigationReady(): Promise<boolean> {
  if (navigationRef.isReady()) return Promise.resolve(true);
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (navigationRef.isReady() || Date.now() - started > READY_TIMEOUT_MS) {
        clearInterval(timer);
        resolve(navigationRef.isReady());
      }
    }, 100);
  });
}
