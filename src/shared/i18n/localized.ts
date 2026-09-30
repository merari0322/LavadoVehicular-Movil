import i18n, { SupportedLanguage } from '../../app/config/i18n';

// Textos en los 4 idiomas con la misma forma (TypeScript avisa si a uno le falta algo)
export type LocalizedTexts<T> = Record<SupportedLanguage, T>;

function currentLanguage(): SupportedLanguage {
  const lang = (i18n.language ?? 'es').slice(0, 2);
  return lang === 'en' || lang === 'fr' || lang === 'pt' ? lang : 'es';
}

function isPlainObject(value: unknown): value is Record<string | symbol, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// valor del idioma actual siguiendo el camino (ej. ['users', 'form', 'title'])
function resolve<T>(dicts: LocalizedTexts<T>, path: (string | symbol)[]): unknown {
  let value: unknown = dicts[currentLanguage()];
  for (const key of path) {
    if (!isPlainObject(value)) return undefined;
    value = value[key];
  }
  return value;
}

function createProxy<T>(dicts: LocalizedTexts<T>, path: (string | symbol)[]): unknown {
  // los grupos se devuelven como otro proxy: así "const texts = X_TEXTS.form" guardado
  // fuera de un componente también cambia de idioma
  const read = (prop: string | symbol): unknown => {
    const value = resolve(dicts, [...path, prop]);
    return isPlainObject(value) ? createProxy(dicts, [...path, prop]) : value;
  };

  return new Proxy(
    {},
    {
      get: (_target, prop) => read(prop),
      has: (_target, prop) => {
        const group = resolve(dicts, path);
        return isPlainObject(group) && prop in group;
      },
      // permite Object.keys / Object.entries sobre un grupo (ej. las opciones de un filtro)
      ownKeys: () => {
        const group = resolve(dicts, path);
        return isPlainObject(group) ? Reflect.ownKeys(group) : [];
      },
      getOwnPropertyDescriptor: (_target, prop) => {
        const group = resolve(dicts, path);
        if (!isPlainObject(group) || !(prop in group)) return undefined;
        return { enumerable: true, configurable: true, writable: false, value: read(prop) };
      },
    },
  );
}

// Devuelve los textos del idioma actual de la app. Se usa igual que el objeto original
// (MANAGEMENT_TEXTS.users.form.title), pero cada acceso lee el idioma elegido en Configuración.
// La pantalla que los muestra debe llamar useTranslation() para volver a pintarse al cambiar.
export function localized<T>(dicts: LocalizedTexts<T>): T {
  return createProxy(dicts, []) as T;
}
