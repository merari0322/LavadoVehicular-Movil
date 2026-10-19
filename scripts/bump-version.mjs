// Sube la versión de la app con versionado semántico (MAYOR.MENOR.PARCHE) en app.json y package.json.
//
//   npm run version:patch   1.1.0 → 1.1.1  (corrección de errores)
//   npm run version:minor   1.1.1 → 1.2.0  (función nueva, compatible)
//   npm run version:major   1.2.0 → 2.0.0  (cambio grande o incompatible)
//
// Después se publica como siempre (publish:update o publish:apk). El versionCode del APK lo sigue
// subiendo EAS solo (autoIncrement); este número es el que ve la persona en Configuración.
import { readFileSync, writeFileSync } from 'node:fs';

const part = process.argv[2];
if (!['major', 'minor', 'patch'].includes(part)) {
  console.error('Uso: node scripts/bump-version.mjs <major|minor|patch>');
  process.exit(1);
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, data) => writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

const app = readJson('app.json');
const current = app.expo.version;
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(current ?? '');
if (!match) {
  console.error(`La versión actual de app.json no es MAYOR.MENOR.PARCHE: ${current}`);
  process.exit(1);
}

let [major, minor, patch] = match.slice(1).map(Number);
if (part === 'major') [major, minor, patch] = [major + 1, 0, 0];
if (part === 'minor') [minor, patch] = [minor + 1, 0];
if (part === 'patch') patch += 1;
const next = `${major}.${minor}.${patch}`;

app.expo.version = next;
writeJson('app.json', app);
const pkg = readJson('package.json');
pkg.version = next;
writeJson('package.json', pkg);

console.log(`Versión ${current} → ${next}`);
