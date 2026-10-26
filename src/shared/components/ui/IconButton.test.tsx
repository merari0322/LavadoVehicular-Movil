/// <reference types="jest" />
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { IconButton } from './IconButton';

// i18n guarda el idioma en AsyncStorage; en las pruebas va el mock de la librería
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockT = (key: string) => `t:${key}`;
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));
const mockColors = { border: '#ddd', card: '#fff', error: '#f00', textSecondary: '#666' };
jest.mock('../../../app/theme', () => ({ useTheme: () => ({ colors: mockColors }) }));

async function pressableOf(element: React.ReactElement) {
  let renderer: TestRenderer.ReactTestRenderer | null = null;
  await act(async () => {
    renderer = TestRenderer.create(element);
  });
  // en jest-expo el Pressable se pinta como una vista: se busca por su hitSlop
  return (renderer as unknown as TestRenderer.ReactTestRenderer).root.findAll((node) => node.props.hitSlop === 4)[0].props;
}

describe('IconButton accesible (MOV-15)', () => {
  it('editar y eliminar se anuncian como botón con su nombre', async () => {
    const edit = await pressableOf(<IconButton icon="edit" onPress={jest.fn()} />);
    expect(edit.accessibilityRole).toBe('button');
    expect(edit.accessibilityLabel).toBe('t:COMMON.EDIT');
    expect((await pressableOf(<IconButton icon="delete" danger onPress={jest.fn()} />)).accessibilityLabel).toBe('t:COMMON.DELETE');
  });

  it('otro ícono usa el nombre que se le pase', async () => {
    expect((await pressableOf(<IconButton icon="refresh" label="Recargar" onPress={jest.fn()} />)).accessibilityLabel).toBe('Recargar');
  });
});
