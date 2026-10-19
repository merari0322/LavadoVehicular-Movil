// Huella nativa (runtimeVersion: fingerprint) que decide a qué APK le llega cada actualización por
// internet (EAS Update). La "version" de app.json no cuenta: así se puede subir MAYOR.MENOR.PARCHE
// en una actualización por internet sin que deje de llegarle al APK instalado.
/** @type {import('expo/fingerprint').Config} */
const { SourceSkips } = require('expo/fingerprint');

module.exports = {
  sourceSkips: SourceSkips.ExpoConfigVersions,
};
