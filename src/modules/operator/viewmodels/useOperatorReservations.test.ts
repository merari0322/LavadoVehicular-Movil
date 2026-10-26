/// <reference types="jest" />
import { OperatorServiceResponse } from '../../../core/services/operations/OperationsService';
import { toReservation } from './useOperatorReservations';

jest.mock('../../../shared/hooks/useFeedback', () => ({ useFeedback: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const service: OperatorServiceResponse = {
  bookingId: 5, code: 'RES-5', bookingStatus: 'CONFIRMED', date: '2026-10-25', startTime: '08:00:00', endTime: '08:45:00',
  services: 'Lavado', vehicle: 'Mazda 3', plate: 'ABC123', total: 40000, status: 'PENDING', startedAt: null,
  finishedAt: null, rating: null, comment: null, startableAt: null, clientName: 'Ana',
};

describe('servicios del operario (B-01)', () => {
  it('trae las indicaciones que dejó el admin al asignar', () => {
    expect(toReservation({ ...service, notes: '  Traer cera para rines  ' }).notes).toBe('Traer cera para rines');
  });

  it('sin indicaciones (o con un backend que todavía no las manda) no se muestra nada', () => {
    expect(toReservation({ ...service, notes: '   ' }).notes).toBeNull();
    expect(toReservation(service).notes).toBeNull();
  });
});
