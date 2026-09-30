import { SetStateAction, useCallback, useSyncExternalStore } from 'react';

// Estado en memoria compartido entre pantallas mientras la app está abierta (como los
// "stores" de la web): si el inicio del admin aprueba un pago, la pantalla de pagos lo ve
// aprobado. Se usa igual que useState, con una llave para cada grupo de datos.
// TODO: reemplazar por los datos de los microservicios cuando existan
interface Entry {
  value: unknown;
  listeners: Set<() => void>;
}

const entries = new Map<string, Entry>();

function entryFor<T>(key: string, initial: T | (() => T)): Entry {
  let entry = entries.get(key);
  if (!entry) {
    const value = typeof initial === 'function' ? (initial as () => T)() : initial;
    entry = { value, listeners: new Set() };
    entries.set(key, entry);
  }
  return entry;
}

export function useSharedState<T>(key: string, initial: T | (() => T)): [T, (action: SetStateAction<T>) => void] {
  const entry = entryFor(key, initial);

  const subscribe = useCallback(
    (listener: () => void) => {
      entry.listeners.add(listener);
      return () => {
        entry.listeners.delete(listener);
      };
    },
    [entry],
  );

  const value = useSyncExternalStore(subscribe, () => entry.value as T, () => entry.value as T);

  const setValue = useCallback(
    (action: SetStateAction<T>) => {
      const next = typeof action === 'function' ? (action as (prev: T) => T)(entry.value as T) : action;
      if (Object.is(next, entry.value)) return;
      entry.value = next;
      entry.listeners.forEach((listener) => listener());
    },
    [entry],
  );

  return [value, setValue];
}

// al cerrar sesión se descartan los datos en memoria (la próxima sesión arranca limpia)
export function clearSharedState(): void {
  entries.clear();
}
