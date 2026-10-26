/// <reference types="jest" />
import {
  getPasswordStrength,
  isColombianPhone,
  isAllowedEmail,
  isValidEmailFormat,
  isPasswordStrong,
  isRequired,
  sanitizeColombianPhoneInput,
  stripSpaces,
} from './authValidators';

describe('authValidators', () => {
  it('A-01: acepta solo los dominios permitidos (gmail.com)', () => {
    expect(isAllowedEmail(' Ana.Perez@Gmail.com ')).toBe(true);
    expect(isAllowedEmail('ana@hotmail.com')).toBe(false);
    expect(isAllowedEmail('ana@gmail.com.co')).toBe(false);
  });

  it('A-01: el inicio de sesión y la recuperación solo revisan el formato, no el dominio', () => {
    // las cuentas que ya existen con otro dominio deben poder entrar y recuperar su contraseña
    expect(isValidEmailFormat('ana@hotmail.com')).toBe(true);
    expect(isValidEmailFormat(' Ana.Perez@Gmail.com ')).toBe(true);
    expect(isValidEmailFormat('ana@')).toBe(false);
    expect(isValidEmailFormat('ana.gmail.com')).toBe(false);
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
