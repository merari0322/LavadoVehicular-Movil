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

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  body?: unknown;
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

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = options.isPublic ? null : authHooks.getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
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
    const problem = (payload ?? {}) as { code?: string; violations?: string[] };
    throw new ApiError(problem.code ?? `HTTP_${response.status}`, response.status, problem.violations ?? []);
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
