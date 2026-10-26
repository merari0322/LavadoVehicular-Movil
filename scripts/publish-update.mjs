// Manda una actualización por internet (EAS Update) a los APK del canal preview. Solo sirve para
// cambios de pantallas y lógica; si cambió algo nativo (paquetes, permisos, ícono) hace falta un APK.
//
//   npm run publish:update -- "qué cambió"
//
// La actualización se arma en este computador: aquí se fija la misma dirección del backend que usa
// el APK (eas.json → build.preview.env), para que no quede apuntando a localhost.
import { readFileSync } from 'node:fs';

const message = process.argv[2];
if (!message) throw new Error('Escribe qué cambió: npm run publish:update -- "arreglo del pago aprobado"');

const preview = JSON.parse(readFileSync(new URL('../eas.json', import.meta.url), 'utf8')).build.preview;
const env = { ...process.env, ...preview.env };
console.log(`Backend de la actualización: ${env.EXPO_PUBLIC_API_URL}`);

// sin preguntas, eas-cli exige el entorno; "preview" no tiene variables guardadas en EAS, así que
// la dirección del backend sale de eas.json (la de arriba). Sin shell, el mensaje viaja tal cual.
runEas(['update', '--channel', preview.channel, '--environment', 'preview', '--message', message, '--non-interactive'],
  { stdio: 'inherit', env });
