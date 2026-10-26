/// <reference types="jest" />
import { inboxEvents } from '../../core/services/notifications/inboxEvents';
import { flush, renderHook } from '../testing/renderHook';
import { useRefreshOnFocus } from './useRefreshOnFocus';

// la navegación de verdad llama al efecto cada vez que la pantalla gana el foco; aquí se llama a mano
let mockFocusEffect: (() => void | (() => void)) | null = null;
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    mockFocusEffect = effect;
  },
}));

const focus = () => (mockFocusEffect?.() ?? undefined) as (() => void) | undefined;

describe('useRefreshOnFocus (datos frescos sin recargar)', () => {
  it('no repite la carga inicial, pero refresca al volver a la pantalla', async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    const hook = await renderHook(() => useRefreshOnFocus(refresh));

    const blur = focus();
    await flush();
    expect(refresh).not.toHaveBeenCalled();

    blur?.();
    focus();
    await flush();
    expect(refresh).toHaveBeenCalledTimes(1);
    await hook.unmount();
  });

  it('refresca al llegar una push solo mientras la pantalla está a la vista', async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    const hook = await renderHook(() => useRefreshOnFocus(refresh));

    const blur = focus();
    inboxEvents.emitChanged();
    await flush();
    expect(refresh).toHaveBeenCalledTimes(1);

    blur?.();
    inboxEvents.emitChanged();
    await flush();
    expect(refresh).toHaveBeenCalledTimes(1);
    await hook.unmount();
  });

  it('un refresco que falla no rompe la pantalla', async () => {
    const refresh = jest.fn().mockRejectedValue(new Error('sin red'));
    const hook = await renderHook(() => useRefreshOnFocus(refresh));

    const blur = focus();
    inboxEvents.emitChanged();
    await flush();
    expect(refresh).toHaveBeenCalledTimes(1);
    blur?.();
    await hook.unmount();
  });
});
