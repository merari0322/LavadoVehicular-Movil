// error de una llamada al backend. El backend responde RFC 9457 (application/problem+json)
// con un "code" estable (ej. EMAIL_ALREADY_REGISTERED) que se traduce en API_ERRORS.<CODE>

// códigos que tienen traducción; cualquier otro cae en UNEXPECTED
const TRANSLATED_CODES = new Set([
  'INVALID_CREDENTIALS',
  'ACCOUNT_DISABLED',
  'EMAIL_ALREADY_REGISTERED',
  'DOCUMENT_ALREADY_REGISTERED',
  'WEAK_PASSWORD',
  'INVALID_RESET_CODE',
  'INCORRECT_CURRENT_PASSWORD',
  'SAME_PASSWORD',
  'INVALID_EMAIL',
  'INVALID_DOCUMENT',
  'INVALID_PHONE',
  'INVALID_NAME',
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'USER_NOT_FOUND',
  'CONFLICT',
  'CANNOT_DISABLE_OWN_ACCOUNT',
  // customer-service
  'PLATE_ALREADY_REGISTERED',
  'CUSTOMER_NOT_PROVISIONED',
  'VEHICLE_NOT_FOUND',
  'INVALID_PLATE',
  'INVALID_VEHICLE_TYPE',
  'NETWORK_ERROR',
]);

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly violations: string[] = [],
  ) {
    super(code);
    this.name = 'ApiError';
  }

  // llave de traducción para mostrar al usuario (API_ERRORS.<CODE>)
  get messageKey(): string {
    return `API_ERRORS.${TRANSLATED_CODES.has(this.code) ? this.code : 'UNEXPECTED'}`;
  }
}

// convierte cualquier error en su llave de traducción
export function apiErrorKey(error: unknown): string {
  return error instanceof ApiError ? error.messageKey : 'API_ERRORS.UNEXPECTED';
}
