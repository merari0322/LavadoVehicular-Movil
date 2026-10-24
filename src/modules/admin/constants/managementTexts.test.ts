/// <reference types="jest" />
import i18n from '../../../app/config/i18n';
import { MAX_DISCOUNT_PERCENT } from '../utils/managementUtils';
import { MANAGEMENT_TEXTS } from './managementTexts';

// i18n guarda el idioma en AsyncStorage; en las pruebas va el mock de la librería
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('textos del descuento de un cupón (E-07)', () => {
  it('el error dice el mismo tope que valida el formulario (99 %) en los 4 idiomas', async () => {
    for (const language of ['es', 'en', 'fr', 'pt']) {
      await i18n.changeLanguage(language);
      expect(MANAGEMENT_TEXTS.promotions.form.errors.discountPercent).toContain(String(MAX_DISCOUNT_PERCENT));
      expect(MANAGEMENT_TEXTS.promotions.form.errors.discountPercent).not.toContain('100');
    }
  });
});
