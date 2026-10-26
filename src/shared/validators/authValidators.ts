// reglas puras y componibles: agregar una regla nueva no obliga a tocar las existentes (OCP)

// A-01: los mismos dominios que ALLOWED_EMAIL_DOMAINS de security-service (por defecto gmail.com).
// La pantalla avisa antes de enviar; quien decide es el servidor (EMAIL_DOMAIN_NOT_ALLOWED)
export const ALLOWED_EMAIL_DOMAINS = ['gmail.com'];
const EMAIL_FORMAT = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
export const COLOMBIAN_PHONE_REGEX = /^3\d{9}$/;
export const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

// solo el formato, sin el dominio: el inicio de sesión y la recuperación de contraseña no se
// restringen por dominio en el servidor, y las cuentas que ya existen con otro dominio deben poder
// entrar (A-01). El dominio se exige solo al registrarse, crear usuarios y cambiar el correo
export function isValidEmailFormat(value: string): boolean {
  return EMAIL_FORMAT.test(value.trim().toLowerCase());
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

// formato válido y dominio permitido (comparación exacta: gmail.com.co no es gmail.com)
export function isAllowedEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  return EMAIL_FORMAT.test(email) && ALLOWED_EMAIL_DOMAINS.includes(email.slice(email.indexOf('@') + 1));
}

export function isColombianPhone(value: string): boolean {
  return COLOMBIAN_PHONE_REGEX.test(value);
}

export function hasMinLength(value: string, length: number): boolean {
  return value.length >= length;
}

export interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function getPasswordStrength(password: string): PasswordStrength {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: SPECIAL_CHAR_REGEX.test(password),
  };
}

export function isPasswordStrong(strength: PasswordStrength): boolean {
  return strength.hasMinLength && strength.hasUppercase && strength.hasNumber && strength.hasSpecialChar;
}

export function stripSpaces(value: string): string {
  return value.replace(/\s/g, '');
}

export function sanitizeColombianPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 0 && digits[0] !== '3') {
    digits = digits.substring(1);
  }
  return digits.substring(0, 10);
}
