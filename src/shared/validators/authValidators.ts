// reglas puras y componibles: agregar una regla nueva no obliga a tocar las existentes (OCP)

export const GMAIL_REGEX = /^[^\s@]+@gmail\.com$/;
export const COLOMBIAN_PHONE_REGEX = /^3\d{9}$/;
export const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isGmailEmail(value: string): boolean {
  return GMAIL_REGEX.test(value);
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
