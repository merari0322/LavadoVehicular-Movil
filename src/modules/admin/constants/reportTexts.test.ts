/// <reference types="jest" />
import en from '../../../app/config/locales/en.json';
import es from '../../../app/config/locales/es.json';
import fr from '../../../app/config/locales/fr.json';
import pt from '../../../app/config/locales/pt.json';
import i18n from '../../../app/config/i18n';
import { REPORT_TEXTS } from './reportTexts';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('exportar reportes (MOV-16)', () => {
  it('el botón dice CSV, que es lo que se genera, en los 4 idiomas', async () => {
    for (const language of ['es', 'en', 'fr', 'pt']) {
      await i18n.changeLanguage(language);
      expect(REPORT_TEXTS.exportModal.excel).toMatch(/CSV/);
    }
    for (const locale of [es, en, fr, pt]) {
      expect(locale.REPORTS.MODAL.EXPORT_EXCEL).toMatch(/CSV/);
      expect(locale.REPORTS.MODAL.EXPORT_EXCEL).not.toMatch(/Excel/);
    }
  });
});
