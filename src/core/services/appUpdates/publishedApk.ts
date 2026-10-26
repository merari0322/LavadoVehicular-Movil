// APK publicado en el servidor (/app/version.json, lo escribe deploy/publish-apk.sh de
// lavarapido-infra). La app lo compara con su propio versionCode para avisar que hay uno nuevo.
import { AppState } from 'react-native';

// MOV-14: corre check ahora y cada vez que la app vuelve a primer plano. Devuelve cómo dejar de escuchar
export function onAppActive(check: () => void): () => void {
  check();
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') check();
  });
  return () => subscription.remove();
}

export interface PublishedApk {
  versionCode: number;
  // ruta en el servidor (/app/LavaRapidoVehicular.apk) o dirección completa
  url: string;
  notes?: string;
}

// el servidor de la app: API_BASE_URL sin el /api/v1 del final
export function siteUrlOf(apiBaseUrl: string): string {
  return apiBaseUrl.replace(/\/api\/v\d+\/?$/, '').replace(/\/+$/, '');
}

/** Valida lo que llega del servidor: sin versionCode entero positivo o sin url, no se usa. */
export function parsePublishedApk(raw: unknown): PublishedApk | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const versionCode = Number(data.versionCode);
  const url = typeof data.url === 'string' ? data.url.trim() : '';
  if (!Number.isInteger(versionCode) || versionCode <= 0 || !url) return null;
  return { versionCode, url, notes: typeof data.notes === 'string' ? data.notes : undefined };
}

/** Si el APK publicado es más nuevo que el instalado. Sin versión instalada conocida (Expo Go, web), no. */
export function isNewerThanInstalled(published: PublishedApk | null, installedBuild: string | null): boolean {
  const installed = Number(installedBuild);
  if (!published || !Number.isInteger(installed) || installed <= 0) return false;
  return published.versionCode > installed;
}

/** Dirección completa del APK (version.json trae una ruta relativa al servidor). */
export function downloadUrlOf(published: PublishedApk, siteUrl: string): string {
  return /^https?:\/\//.test(published.url) ? published.url : `${siteUrl}${published.url.startsWith('/') ? '' : '/'}${published.url}`;
}

export async function fetchPublishedApk(siteUrl: string, timeoutMs = 8000): Promise<PublishedApk | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${siteUrl}/app/version.json`, { signal: controller.signal, headers: { 'Cache-Control': 'no-cache' } });
    return response.ok ? parsePublishedApk(await response.json()) : null;
  } catch {
    // sin red o sin APK publicado: no se avisa nada
    return null;
  } finally {
    clearTimeout(timer);
  }
}
