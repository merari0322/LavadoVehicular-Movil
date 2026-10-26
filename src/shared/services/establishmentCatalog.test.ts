/// <reference types="jest" />
import { bookingService } from '../../core/services/booking/BookingService';
import { establishmentText, loadEstablishment } from './establishmentCatalog';

// i18n guarda el idioma en AsyncStorage; en las pruebas va el mock de la librería
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('../../core/services/booking/BookingService', () => ({ bookingService: { establishment: jest.fn() } }));

describe('datos del negocio (MOV-09)', () => {
  it('mientras no llegan no se muestra un negocio de ejemplo, sino "Cargando..."', () => {
    expect(establishmentText('', 'Cargando...')).toBe('Cargando...');
    expect(establishmentText(' Calle 10 # 20-30 ', 'Cargando...')).toBe('Calle 10 # 20-30');
  });

  it('si la red falla se queda vacío y se puede volver a pedir', async () => {
    jest.mocked(bookingService.establishment).mockRejectedValueOnce(new Error('sin red'));
    await loadEstablishment();
    expect(establishmentText(null, 'Cargando...')).toBe('Cargando...');

    // la sede responde, pero sin dirección: texto neutro, no "Cargando..." para siempre
    jest.mocked(bookingService.establishment).mockResolvedValueOnce({ tradeName: 'LavaRápido', address: null } as never);
    await loadEstablishment();
    expect(bookingService.establishment).toHaveBeenCalledTimes(2);
    expect(establishmentText(null, 'Cargando...')).toBe('—');
  });
});
