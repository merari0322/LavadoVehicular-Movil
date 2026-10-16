// Publica en el servidor el último APK compilado con EAS (perfil preview): lo deja en
// /app/LavaRapidoVehicular.apk y actualiza /app/version.json, así el botón de la web baja esta
// versión y la app avisa a quien tenga una más vieja.
//
//   npm run publish:apk -- "qué cambió"            (último build preview de Android terminado)
//   npm run publish:apk -- "qué cambió" <buildId>  (un build en particular)
//
// Servidor: DEPLOY_HOST (por defecto el de Azure) y la llave DEPLOY_SSH_KEY (~/.ssh/lavarapido_azure).
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const [notes = '', buildId] = process.argv.slice(2);
const host = process.env.DEPLOY_HOST ?? 'azureuser@64.236.160.129';
const key = process.env.DEPLOY_SSH_KEY ?? join(homedir(), '.ssh', 'lavarapido_azure');

const eas = (args) => JSON.parse(execFileSync('eas', [...args, '--json'], { encoding: 'utf8', shell: true }));

// build:view no acepta --non-interactive (build:list sí)
const build = buildId
  ? eas(['build:view', buildId])
  : eas(['build:list', '--platform', 'android', '--build-profile', 'preview', '--status', 'finished', '--limit', '1', '--non-interactive'])[0];
if (!build) throw new Error('No hay un build preview de Android terminado');

const url = build.artifacts?.applicationArchiveUrl ?? build.artifacts?.buildUrl;
const versionCode = Number(build.appBuildVersion);
if (!url || !Number.isInteger(versionCode)) throw new Error(`El build ${build.id} no trae APK o versionCode`);

console.log(`Publicando build ${build.id} (versionCode ${versionCode})...`);
// las notas viajan como un solo argumento con comillas simples escapadas para el shell remoto
const quoted = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;
execFileSync('ssh', ['-i', key, '-o', 'BatchMode=yes', host,
  `bash ~/lavarapido/lavarapido-infra/deploy/publish-apk.sh ${quoted(url)} ${versionCode} ${quoted(notes)}`], { stdio: 'inherit' });
