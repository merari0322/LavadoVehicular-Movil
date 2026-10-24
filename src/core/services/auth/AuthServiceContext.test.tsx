/// <reference types="jest" />
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { registerAuthHooks, request } from '../../api/httpClient';
import { AuthServiceProvider, onBeforeSignOut, useSession } from './AuthServiceContext';
import { IAuthService } from './auth.types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockSaved = { current: null as unknown };
jest.mock('../../storage/sessionStorage', () => ({
  loadSession: () => Promise.resolve(mockSaved.current),
  saveSession: () => Promise.resolve(),
  clearSession: () => Promise.resolve(),
}));

const user = { id: 7, email: 'ana@gmail.com', documentNumber: '1', firstName: 'Ana', lastName: 'Ruiz',
  phone: null, roles: ['CLIENT'], active: true, lastLogin: null };
const service = { login: jest.fn(), logout: jest.fn() } as unknown as IAuthService;

const fetchMock = jest.fn();
const settle = async () => {
  for (let i = 0; i < 5; i += 1) await act(async () => { await Promise.resolve(); });
};

async function mount() {
  const state: { status?: string; expired?: boolean } = {};
  function Probe() {
    const session = useSession();
    state.status = session.status;
    state.expired = session.expired;
    return null;
  }
  let renderer: TestRenderer.ReactTestRenderer | null = null;
  await act(async () => {
    renderer = TestRenderer.create(<AuthServiceProvider service={service}><Probe /></AuthServiceProvider>);
  });
  await settle();
  return { state, unmount: () => act(() => renderer?.unmount()) };
}

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  jest.useRealTimers();
  registerAuthHooks({ getToken: () => null, onUnauthorized: () => undefined });
});

describe('sesión vencida o rechazada (MOV-10)', () => {
  it('un 401 cierra la sesión y antes da de baja el push (una sola vez)', async () => {
    mockSaved.current = { accessToken: 'jwt', expiresAt: new Date(Date.now() + 3_600_000).toISOString(), user };
    fetchMock.mockResolvedValue({ ok: false, status: 401, text: () => Promise.resolve('{"code":"UNAUTHORIZED"}') });
    // la baja del push también recibe 401: no debe volver a disparar el cierre
    const unregister = jest.fn(() => request<void>('POST', '/notifications/devices/unregister', { body: { token: 'x' } }));
    const off = onBeforeSignOut(unregister);
    const app = await mount();
    expect(app.state.status).toBe('signedIn');

    await act(async () => {
      await request('GET', '/bookings/me').catch(() => undefined);
    });
    await settle();

    expect(unregister).toHaveBeenCalledTimes(1);
    expect(app.state.status).toBe('signedOut');
    expect(app.state.expired).toBe(true);
    off();
    await app.unmount();
  });

  it('al vencer el token, el push se da de baja un minuto antes, con el token todavía válido', async () => {
    jest.useFakeTimers();
    mockSaved.current = { accessToken: 'jwt', expiresAt: new Date(Date.now() + 120_000).toISOString(), user };
    const unregister = jest.fn(() => Promise.resolve());
    const off = onBeforeSignOut(unregister);
    const app = await mount();

    await act(async () => {
      jest.advanceTimersByTime(59_000);
    });
    expect(unregister).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(2_000);
    });
    await settle();

    expect(unregister).toHaveBeenCalledTimes(1);
    expect(app.state.status).toBe('signedOut');
    off();
    await app.unmount();
  });
});
