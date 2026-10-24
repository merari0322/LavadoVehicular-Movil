/// <reference types="jest" />
import { registerAuthHooks } from './httpClient';
import { fetchAllPages } from './pagination';
import { notificationService } from '../services/notifications/NotificationService';
import { userAdminService } from '../services/users/UserAdminService';
import { validateWeek } from '../../modules/admin/viewmodels/useSchedule';
import { DaySchedule } from '../../modules/admin/models/schedule';

// i18n guarda el idioma en AsyncStorage; en las pruebas va el mock de la librería
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// useSchedule usa la sesión; aquí no hace falta
jest.mock('../services/auth', () => ({ useSession: jest.fn() }));

const fetchMock = jest.fn();
const page = (items: unknown[], pageNumber: number, totalPages: number) =>
  Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify({ items, page: pageNumber, size: 100, totalElements: 0, totalPages })),
  });

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  registerAuthHooks({ getToken: () => 'token', onUnauthorized: jest.fn() });
});

describe('listados de más de 100 (MOV-13)', () => {
  it('fetchAllPages sigue hasta la última página o hasta el tope', async () => {
    const fetchPage = jest.fn((n: number) => Promise.resolve({ items: [n], totalPages: 4 }));
    expect(await fetchAllPages(fetchPage, 10)).toEqual([0, 1, 2, 3]);
    expect(await fetchAllPages(fetchPage, 2)).toEqual([0, 1]);
  });

  it('usuarios: se piden todas las páginas de 100', async () => {
    const user = (id: number) => ({ id, email: `u${id}@gmail.com`, documentNumber: String(id), firstName: 'U',
      lastName: 'X', phone: null, roles: ['CLIENT'], active: true });
    fetchMock.mockImplementationOnce(() => page([user(1)], 0, 2)).mockImplementationOnce(() => page([user(2)], 1, 2));

    const accounts = await userAdminService.listAccounts();

    // toAuthUser deja el id como texto
    expect(accounts.map((a) => a.id)).toEqual(['1', '2']);
    expect(fetchMock.mock.calls[1][0]).toMatch(/page=1&size=100/);
  });

  it('bandeja: llegan más de 100 notificaciones', async () => {
    fetchMock.mockImplementationOnce(() => page([{ id: 1 }], 0, 2)).mockImplementationOnce(() => page([{ id: 2 }], 1, 2));
    expect((await notificationService.list()).map((n) => n.id)).toEqual([1, 2]);
  });
});

describe('pausa del horario igual que booking-service (MOV-13)', () => {
  const day = (opening: string, closing: string, breakId: string) =>
    ({ day: 'monday', open: true, opening, closing, breakId }) as unknown as DaySchedule;

  it('la pausa no puede empezar al abrir ni terminar al cerrar', () => {
    const errorsOf = (d: DaySchedule) => Object.values(validateWeek([d]));
    expect(errorsOf(day('12:00', '18:00', '12:00-13:00'))).toHaveLength(1);
    expect(errorsOf(day('08:00', '13:00', '12:00-13:00'))).toHaveLength(1);
    expect(errorsOf(day('08:00', '18:00', '12:00-13:00'))).toHaveLength(0);
  });
});
