/// <reference types="jest" />
import { AppState, AppStateStatus } from 'react-native';

import { onAppActive } from './publishedApk';

describe('APK obligatorio también al volver a primer plano (MOV-14)', () => {
  it('revisa al abrir y cada vez que la app vuelve a estar activa', () => {
    let listener: ((state: AppStateStatus) => void) | null = null;
    const remove = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
      listener = handler as (state: AppStateStatus) => void;
      return { remove } as unknown as ReturnType<typeof AppState.addEventListener>;
    });
    const check = jest.fn();

    const stop = onAppActive(check);
    expect(check).toHaveBeenCalledTimes(1);

    listener!('background');
    expect(check).toHaveBeenCalledTimes(1);
    listener!('active');
    expect(check).toHaveBeenCalledTimes(2);

    stop();
    expect(remove).toHaveBeenCalled();
  });
});
