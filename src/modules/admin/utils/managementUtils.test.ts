/// <reference types="jest" />
import { isValidAccountEmail, isValidDiscountPercent } from './managementUtils';
import { validateProfile } from '../../../shared/validators/profileValidators';

describe('reglas del módulo de gestión', () => {
  it('E-07: el descuento de un cupón va de 1 a 99 %', () => {
    expect(isValidDiscountPercent(1)).toBe(true);
    expect(isValidDiscountPercent(99)).toBe(true);
    expect(isValidDiscountPercent(100)).toBe(false);
    expect(isValidDiscountPercent(0)).toBe(false);
  });

  it('A-01: crear usuario exige un correo de dominio permitido', () => {
    expect(isValidAccountEmail('oscar@gmail.com')).toBe(true);
    expect(isValidAccountEmail('oscar@outlook.com')).toBe(false);
  });

  it('A-01: el perfil acepta el correo antiguo sin cambiar, pero no uno nuevo de otro dominio', () => {
    const values = { firstName: 'Ana', lastName: 'Ruiz', email: 'ana@outlook.com', phoneCountry: 'CO',
      phoneNumber: '3001234567', address: '' };
    expect(validateProfile(values, 'ana@outlook.com').email).toBeUndefined();
    expect(validateProfile({ ...values, email: 'ana@yahoo.com' }, 'ana@outlook.com').email).toBe('profile.validation.emailInvalid');
  });
});
