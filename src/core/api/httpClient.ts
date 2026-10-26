import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';
import { ApiError } from './apiError';

// quién da el token y qué hacer si el servidor lo rechaza. Lo registra la sesión al arrancar,
// así este archivo no depende de React ni de la pantalla (lo pueden usar todos los servicios).
interface AuthHooks {
  getToken: () => string | null;
  onUnauthorized: () => void;
}

let authHooks: AuthHooks = {
  getToken: () => null,
  onUnauthorized: () => undefined,
};

export function registerAuthHooks(hooks: AuthHooks): void {
  authHooks = hooks;
}

// encabezado con el token, para lo que no pasa por request() (ej. una <Image> que exige sesión)
export function authorizationHeader(): Record<string, string> {
  const token = authHooks.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type HttpMethod ='GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  // formulario con archivos (ej. fotos): fetch arma solo el multipart y su boundary
  form?: FormData;
  // espera máxima propia (subir fotos tarda más que una petición normal)
  timeoutMs?: number;
  query?: Record<string, string | number | undefined>;
  // endpoints públicos (login, registro, recuperación): un 401 ahí no es "sesión vencida"
  isPublic?: boolean;
  // microservicio al que va la petición (por defecto el security-service)
  baseUrl?: string;
}

// cliente HTTP único: agrega el token, convierte los errores del backend en ApiError y
// detecta la falta de conexión (backend apagado, IP equivocada, sin wifi)
export async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(options.baseUrl ?? API_BASE_URL, path, options.query);
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (options.body !== undefined && !options.form) {
    headers['Content-Type'] = 'application/json';
  }

  const token = options.isPublic ? null : authHooks.getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: options.form ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
      signal: controller.signal,
    });
  } catch {
    // no hubo respuesta: servidor apagado, sin red o tiempo de espera agotado
    throw new ApiError('NETWORK_ERROR', 0);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await readJson(response);

  if (!response.ok) {
    if (response.status === 401 && !options.isPublic) {
      authHooks.onUnauthorized();
    }
    // el mapa "errors" de un 400 (campo → mensaje) queda en ApiError.fieldErrors. payment-service
    // (ASP.NET) manda ese mapa sin "code" cuando falla la validación del modelo: es un VALIDATION_ERROR
    const problem = (payload ?? {}) as { code?: string; violations?: string[]; errors?: unknown };
    const code = problem.code ?? (response.status === 400 && problem.errors ? 'VALIDATION_ERROR' : `HTTP_${response.status}`);
    throw new ApiError(code, response.status, problem.violations ?? [], payload ?? undefined);
  }

  return payload as T;
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']): string {
  const params = Object.entries(query ?? {})
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `${baseUrl}${path}${params ? `?${params}` : ''}`;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
