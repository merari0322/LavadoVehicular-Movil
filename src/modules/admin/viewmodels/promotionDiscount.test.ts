/// <reference types="jest" />
import { PromotionForCustomer, PromotionView } from '../../../core/services/payments/PaymentService';
import { benefitTitle } from '../../client/viewmodels/useClientLoyalty';
import { toPromotion, toSaveRequest } from './useManagement';

// i18n guarda el idioma en AsyncStorage; en las pruebas va el mock de la librería
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const view: PromotionView = {
  id: 3, code: 'FIJO5000', name: 'Fijo', description: null, icon: null, featured: false, benefits: [],
  validFrom: '2026-10-01', validTo: '2099-12-31', status: 'active', redemptions: 0,
  discountPercent: 0, requiredPoints: 0, discountType: 'FIXED', discountValue: 5000,
};

describe('descuento real de las promociones (D-01)', () => {
  it('admin: un cupón FIXED se edita y se guarda en pesos, sin volverse porcentaje', () => {
    const promotion = toPromotion(view);
    expect(promotion.discountType).toBe('FIXED');
    expect(promotion.discountValue).toBe(5000);

    const { id, redemptions, status, ...values } = promotion;
    const request = toSaveRequest(values);
    expect(request).toMatchObject({ discountType: 'FIXED', discountValue: 5000, discountPercent: 0 });
  });

  it('admin: un backend que no manda el tipo se toma como porcentaje', () => {
    const { discountType, discountValue, ...old } = view;
    expect(toPromotion({ ...old, discountPercent: 15 })).toMatchObject({ discountType: 'PERCENT', discountValue: 15 });
  });

  it('cliente: el FIXED se muestra como monto y no como "0 %"', () => {
    const base = { id: 1, code: 'X', name: 'Bono', description: null, icon: null, featured: false,
      benefits: [] as string[], requiredPoints: 0, unlocked: true };
    expect(benefitTitle({ ...base, discountPercent: 0, discountType: 'FIXED', discountValue: 5000 } as PromotionForCustomer))
      .toBe('Bono · $5.000 OFF');
    expect(benefitTitle({ ...base, discountPercent: 10, discountType: 'PERCENT', discountValue: 10 } as PromotionForCustomer))
      .toBe('Bono · 10% OFF');
    expect(benefitTitle({ ...base, discountPercent: 0 } as PromotionForCustomer)).toBe('Bono');
  });
});
