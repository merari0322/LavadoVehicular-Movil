// Utilidades de validación para configuración

// Cuenta los dígitos de un texto (para validar teléfonos con espacios o prefijo +57)
export const countDigits = (value: string): number => value.replace(/\D/g, '').length;

// Valida un correo con el formato básico usuario@dominio.ext
export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
