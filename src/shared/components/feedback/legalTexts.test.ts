/// <reference types="jest" />
import en from '../../../app/config/locales/en.json';
import es from '../../../app/config/locales/es.json';
import fr from '../../../app/config/locales/fr.json';
import pt from '../../../app/config/locales/pt.json';

// Términos y Condiciones que abre LegalDocumentModal: contrato pago-reserva del 26-10-2026
const LOCALES = { es, en, fr, pt };

describe('Términos: plazo del pago digital y límite de efectivo (26-10-2026)', () => {
  it.each(Object.entries(LOCALES))('%s: la sección de reservas explica el plazo de 30 minutos y el límite de efectivo', (_, locale) => {
    const bookings = locale.LEGAL.TERMS.SECTIONS[5];
    expect(bookings.HEADING.startsWith('6.')).toBe(true);
    expect(bookings.BODY).toContain('30');
  });

  it.each(Object.entries(LOCALES))('%s: la sección de pagos separa el QR con comprobante del efectivo sin comprobante', (_, locale) => {
    const payments = locale.LEGAL.TERMS.SECTIONS[6];
    expect(payments.HEADING.startsWith('7.')).toBe(true);
    expect(payments.BODY).toContain('QR');
    expect(payments.BODY).toMatch(/Nequi/);
  });

  it('la fecha de última actualización es la del 26 de octubre de 2026', () => {
    expect(es.LEGAL.LAST_UPDATED_DATE).toBe('26 de octubre de 2026');
    expect(en.LEGAL.LAST_UPDATED_DATE).toBe('October 26, 2026');
    expect(fr.LEGAL.LAST_UPDATED_DATE).toBe('26 octobre 2026');
    expect(pt.LEGAL.LAST_UPDATED_DATE).toBe('26 de outubro de 2026');
  });
});
