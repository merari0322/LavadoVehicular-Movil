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
  // booking-service
  'SLOT_UNAVAILABLE',
  'VEHICLE_ALREADY_BOOKED',
  'SERVICE_NOT_AVAILABLE_FOR_VEHICLE',
  'INVALID_DATE',
  'CUSTOMER_SERVICE_UNAVAILABLE',
  'BOOKING_NOT_CHANGEABLE',
  // códigos del operations-service (operarios, asignación, ejecución y calificaciones)
  'OPERATOR_NOT_ON_SHIFT',
  'OPERATOR_INACTIVE',
  'OPERATOR_ABSENT',
  'OPERATOR_BUSY',
  'BOOKING_NOT_ASSIGNABLE',
  'BOOKING_STATE_CONFLICT',
  'EXECUTION_ALREADY_STARTED',
  'EXECUTION_NOT_STARTED',
  'SERVICE_NOT_COMPLETED',
  'ALREADY_RATED',
  'ABSENCE_OVERLAP',
  'OPERATOR_NOT_FOUND',
  'BOOKING_NOT_FOUND',
  'BOOKING_SERVICE_UNAVAILABLE',
  // canje de cupones de fidelización (payment-service, ADR-015)
  'PROMOTION_NOT_FOUND',
  'PROMOTION_NOT_REDEEMABLE',
  'PROMOTION_ALREADY_REDEEMED',
  'NETWORK_ERROR',
]);

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly violations: string[] = [],
    // el cuerpo completo del problema (RFC 9457) por si un código necesita más datos,
    // ej. las "alternatives" del 409 SLOT_UNAVAILABLE del booking-service
    public readonly data?: unknown,
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

// horas libres que el booking-service propone en el 409 SLOT_UNAVAILABLE (RF-006):
// devuelve hasta 5 "HH:mm" del mismo día, o null si el error no es ese
export function slotAlternatives(error: unknown): string[] | null {
  if (!(error instanceof ApiError) || error.status !== 409 || error.code !== 'SLOT_UNAVAILABLE') return null;
  const problem = error.data as { alternatives?: unknown } | null;
  if (!Array.isArray(problem?.alternatives)) return null;
  return problem.alternatives.filter((value): value is string => typeof value === 'string');
}
