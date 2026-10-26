// error de una llamada al backend. El backend responde RFC 9457 (application/problem+json)
// con un "code" estable (ej. EMAIL_ALREADY_REGISTERED) que se traduce en API_ERRORS.<CODE>
import es from '../../app/config/locales/es.json';

// códigos que tienen traducción: las llaves de API_ERRORS (el español es la base y las pruebas
// revisan que en, fr y pt tengan las mismas). Un código sin traducción cae en el mensaje
// genérico de su estado HTTP (MOV-06), no en "error inesperado"
const TRANSLATED_CODES = new Set(Object.keys(es.API_ERRORS).filter((key) => key !== 'FIELDS' && key !== 'UNEXPECTED'));

// mensaje genérico por estado HTTP (ej. HTTP_404, o el NOT_FOUND que ponen los servicios Java)
function codeForStatus(status: number): string {
  if (status === 0) return 'NETWORK_ERROR';
  if (status === 400 || status === 422) return 'BAD_REQUEST';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 502 || status === 503 || status === 504) return 'SERVICE_UNAVAILABLE';
  if (status >= 500) return 'INTERNAL_ERROR';
  return 'UNEXPECTED';
}

// campos del mapa "errors" de un 400 VALIDATION_ERROR que tienen mensaje propio (API_ERRORS.FIELDS):
// nombre del campo en la API, en minúsculas → llave
const FIELD_KEYS: Record<string, string> = {
  notes: 'NOTES',
  assignmentnotes: 'NOTES',
  reason: 'REASON',
  reasoncode: 'REASON',
  rejectionreason: 'REASON',
  comment: 'COMMENT',
  email: 'EMAIL',
  newemail: 'EMAIL',
  phone: 'PHONE',
  address: 'ADDRESS',
  name: 'NAME',
  firstname: 'NAME',
  lastname: 'NAME',
  documentnumber: 'DOCUMENT',
  password: 'PASSWORD',
  newpassword: 'PASSWORD',
  currentpassword: 'PASSWORD',
  transactionreference: 'REFERENCE',
  reportedamount: 'AMOUNT',
  amount: 'AMOUNT',
  date: 'DATE',
  time: 'TIME',
  starttime: 'TIME',
};

// "$.notes", "request.Notes" o "notes" → "notes"
const fieldName = (key: string) => (key.split('.').pop() ?? key).toLowerCase();

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

  // mapa "errors" de un 400 de validación: campo → mensaje del servidor. Los servicios Java mandan
  // un texto por campo y payment-service (ASP.NET) una lista; aquí queda el primer texto
  get fieldErrors(): Record<string, string> {
    const errors = (this.data as { errors?: unknown } | undefined)?.errors;
    if (!errors || typeof errors !== 'object') return {};
    const result: Record<string, string> = {};
    for (const [field, value] of Object.entries(errors as Record<string, unknown>)) {
      const text = Array.isArray(value) ? value[0] : value;
      result[field] = typeof text === 'string' ? text : '';
    }
    return result;
  }

  // llave de traducción para mostrar al usuario (API_ERRORS.<CODE>). Una hora fuera del horario,
  // un día cerrado o una hora pasada no se muestran como "ya no está disponible"; un 400 de
  // validación dice qué campo revisar si es uno conocido
  get messageKey(): string {
    const reason = (this.data as { reason?: unknown } | undefined)?.reason;
    if (this.code === 'SLOT_UNAVAILABLE' && typeof reason === 'string' && TRANSLATED_CODES.has(`SLOT_${reason}`)) {
      return `API_ERRORS.SLOT_${reason}`;
    }
    if (this.code === 'VALIDATION_ERROR') {
      const field = Object.keys(this.fieldErrors).map((key) => FIELD_KEYS[fieldName(key)]).find(Boolean);
      if (field) return `API_ERRORS.FIELDS.${field}`;
    }
    return `API_ERRORS.${TRANSLATED_CODES.has(this.code) ? this.code : codeForStatus(this.status)}`;
  }
}

// convierte cualquier error en su llave de traducción
export function apiErrorKey(error: unknown): string {
  return error instanceof ApiError ? error.messageKey : 'API_ERRORS.UNEXPECTED';
}

// código estable del backend (ej. ACCOUNT_LOCKED), o null si no vino del backend
export function apiErrorCode(error: unknown): string | null {
  return error instanceof ApiError ? error.code : null;
}

// horas libres que el booking-service propone en el 409 SLOT_UNAVAILABLE (RF-006):
// devuelve hasta 5 "HH:mm" del mismo día, o null si el error no es ese
export function slotAlternatives(error: unknown): string[] | null {
  if (!(error instanceof ApiError) || error.status !== 409 || error.code !== 'SLOT_UNAVAILABLE') return null;
  const problem = error.data as { alternatives?: unknown } | null;
  if (!Array.isArray(problem?.alternatives)) return null;
  return problem.alternatives.filter((value): value is string => typeof value === 'string');
}
