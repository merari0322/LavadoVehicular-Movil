// Huella nativa (runtimeVersion: fingerprint) que decide a qué APK le llega cada actualización por
// internet (EAS Update). La "version" de app.json no cuenta: así se puede subir MAYOR.MENOR.PARCHE
// en una actualización por internet sin que deje de llegarle al APK instalado.
// Se suma a lo que Expo ya omite por defecto (los scripts android/ios de package.json que el
// prebuild de EAS reescribe); si se reemplazara, la huella de EAS no coincidiría con la local.
/** @type {import('expo/fingerprint').Config} */
const { DEFAULT_SOURCE_SKIPS, SourceSkips } = require('expo/fingerprint');

module.exports = {
  sourceSkips: DEFAULT_SOURCE_SKIPS | SourceSkips.ExpoConfigVersions,
};
