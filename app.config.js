// google-services.json no va en el repo: lleva la llave de Firebase. En EAS llega como variable de
// tipo archivo (GOOGLE_SERVICES_JSON); en un build local se usa la copia ignorada de la raíz.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
});
