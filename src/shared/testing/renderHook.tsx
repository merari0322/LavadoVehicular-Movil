/// <reference types="jest" />
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

// solo para las pruebas (jest-expo): monta un hook en un componente vacío y deja leer lo que
// devuelve después de cada render. react-test-renderer ya viene con jest-expo
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export async function renderHook<T>(useHook: () => T) {
  const current: { value: T | null } = { value: null };
  function Probe() {
    current.value = useHook();
    return null;
  }
  let renderer: TestRenderer.ReactTestRenderer | null = null;
  await act(async () => {
    renderer = TestRenderer.create(<Probe />);
  });
  return {
    get result(): T {
      return current.value as T;
    },
    unmount: () => act(() => renderer?.unmount()),
  };
}

// deja que terminen las promesas pendientes y los renders que disparan
export async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

export { act };
