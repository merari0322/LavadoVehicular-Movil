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

  it('la sección de reservas habla de "el Cliente" en tercera persona, sin tuteo', () => {
    const body = es.LEGAL.TERMS.SECTIONS[5].BODY;
    expect(body).toContain('Si el Cliente elige pago digital, debe cargar el comprobante');
    expect(body).toContain('el Cliente puede tener como máximo una reserva activa');
    expect(body).not.toMatch(/\b(eliges|debes|puedes)\b/);
    expect(en.LEGAL.TERMS.SECTIONS[5].BODY).not.toContain('If you choose');
    expect(fr.LEGAL.TERMS.SECTIONS[5].BODY).not.toContain('vous');
    expect(pt.LEGAL.TERMS.SECTIONS[5].BODY).not.toContain('você');
  });

  it.each(Object.entries(LOCALES))('%s: la sección 8 explica el informe de inspección y las demás se renumeran', (_, locale) => {
    const sections = locale.LEGAL.TERMS.SECTIONS;
    expect(sections).toHaveLength(16);
    sections.forEach((s, i) => expect(s.HEADING.startsWith(`${i + 1}.`)).toBe(true));
    expect(sections[7].BODY).toContain('JPEG');
    expect(sections[7].BODY).toContain('2 M');
  });

  it('la Política incluye las fotografías de la inspección sin inventar un plazo de conservación', () => {
    const privacy = es.LEGAL.PRIVACY.SECTIONS;
    expect(es.LEGAL.TERMS.SECTIONS[7].BODY).toContain('el enlace es personal y el Cliente no debe compartirlo');
    expect(privacy[3].BODY).toContain('fotografías del vehículo tomadas durante la inspección');
    expect(privacy[4].BODY).toContain('atender reclamaciones por daños');
    expect(privacy[11].BODY).toContain('durante el tiempo necesario para atender reclamaciones sobre el servicio, conforme a esta política');
  });

  it('la fecha de última actualización es la del 26 de octubre de 2026', () => {
    expect(es.LEGAL.LAST_UPDATED_DATE).toBe('26 de octubre de 2026');
    expect(en.LEGAL.LAST_UPDATED_DATE).toBe('October 26, 2026');
    expect(fr.LEGAL.LAST_UPDATED_DATE).toBe('26 octobre 2026');
    expect(pt.LEGAL.LAST_UPDATED_DATE).toBe('26 de outubro de 2026');
  });
});
