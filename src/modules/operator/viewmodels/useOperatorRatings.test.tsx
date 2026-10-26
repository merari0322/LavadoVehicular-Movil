/// <reference types="jest" />
import { operationsService } from '../../../core/services/operations/OperationsService';
import { act, flush, renderHook } from '../../../shared/testing/renderHook';
import { averageRating, useOperatorRatings } from './useOperatorRatings';

// i18n guarda el idioma en AsyncStorage; en las pruebas va el mock de la librería
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockT = (key: string) => key;
// se deja el resto de react-i18next (i18n.ts lo usa al cargar los textos) y solo se fija t
jest.mock('react-i18next', () => ({ ...jest.requireActual('react-i18next'), useTranslation: () => ({ t: mockT }) }));
jest.mock('../../../core/services/operations/OperationsService', () => ({ operationsService: { myRatings: jest.fn() } }));

const rating = (bookingId: number, value: number, services = 'Lavado') => ({
  bookingId, bookingCode: `RES-${bookingId}`, date: '2026-10-20', services, plate: 'ABC123', clientName: 'Ana',
  rating: value, comment: null,
});

describe('calificaciones del operario (MOV-04)', () => {
  it('el promedio tiene un decimal y es 0 sin calificaciones (la misma regla en el inicio)', () => {
    expect(averageRating([])).toBe(0);
    expect(averageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toBe(4.3);
  });

  it('carga, calcula la satisfacción y filtra por estrellas', async () => {
    jest.mocked(operationsService.myRatings).mockResolvedValue([rating(1, 5), rating(2, 3, 'Encerado')] as never);
    const hook = await renderHook(() => useOperatorRatings());
    await flush();

    expect(hook.result.average).toBe(4);
    expect(hook.result.satisfaction).toBe(80);
    expect(hook.result.serviceTypes).toEqual(['Lavado', 'Encerado']);

    await act(async () => {
      hook.result.setStars('3');
    });
    expect(hook.result.visible.map((r) => r.id)).toEqual([2]);
    await act(async () => {
      hook.result.clear();
    });
    expect(hook.result.visible).toHaveLength(2);
    await hook.unmount();
  });

  it('si operations-service no responde queda el error para mostrarlo', async () => {
    jest.mocked(operationsService.myRatings).mockRejectedValue(new Error('caído'));
    const hook = await renderHook(() => useOperatorRatings());
    await flush();
    expect(hook.result.loadError).toBe('API_ERRORS.UNEXPECTED');
    await hook.unmount();
  });
});
