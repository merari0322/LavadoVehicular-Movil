/// <reference types="jest" />
import { manualPaymentAccounts } from './paymentUtils';

// i18n guarda el idioma en AsyncStorage; en las pruebas va el mock de la librería
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('pago en caja (C-04)', () => {
  it('la cuenta de efectivo se ofrece aunque esté inactiva; las demás inactivas no', () => {
    const list = [
      { id: 1, methodCode: 'EFECTIVO', active: false },
      { id: 2, methodCode: 'NEQUI', active: false },
      { id: 3, methodCode: 'DAVIPLATA', active: true },
    ];
    expect(manualPaymentAccounts(list).map((a) => a.id)).toEqual([1, 3]);
  });
});
