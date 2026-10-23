/// <reference types="jest" />
import {
  getPasswordStrength,
  isColombianPhone,
  isGmailEmail,
  isPasswordStrong,
  isRequired,
  sanitizeColombianPhoneInput,
  stripSpaces,
} from './authValidators';

describe('authValidators', () => {
  it('acepta solo correos @gmail.com', () => {
    expect(isGmailEmail('ana.perez@gmail.com')).toBe(true);
    expect(isGmailEmail('ana@hotmail.com')).toBe(false);
    expect(isGmailEmail('ana@gmail.com.co')).toBe(false);
  });

  it('valida el celular colombiano (10 dígitos que empiezan por 3)', () => {
    expect(isColombianPhone('3001234567')).toBe(true);
    expect(isColombianPhone('6011234567')).toBe(false);
    expect(isColombianPhone('300123456')).toBe(false);
  });

  it('limpia lo que escribe el usuario en el celular', () => {
    // un 0 al inicio se descarta y nunca pasa de 10 dígitos
    expect(sanitizeColombianPhoneInput('0300 123 4567')).toBe('3001234567');
    expect(sanitizeColombianPhoneInput('300123456789')).toBe('3001234567');
    expect(sanitizeColombianPhoneInput('300-123-4567')).toBe('3001234567');
    expect(stripSpaces(' ana @ gmail.com ')).toBe('ana@gmail.com');
  });

  it('la contraseña fuerte cumple las 4 reglas del backend', () => {
    expect(isPasswordStrong(getPasswordStrength('Lavado2026!'))).toBe(true);
    expect(getPasswordStrength('lavado2026!').hasUppercase).toBe(false);
    expect(getPasswordStrength('Lavado!').hasMinLength).toBe(false);
    expect(isPasswordStrong(getPasswordStrength('Lavado2026'))).toBe(false);
  });

  it('isRequired no acepta solo espacios', () => {
    expect(isRequired('   ')).toBe(false);
    expect(isRequired(' a ')).toBe(true);
  });
});
