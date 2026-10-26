// Programas externos de los scripts de publicación, con ruta absoluta: no se buscan en el PATH ni
// se corren a través de un shell, así ningún argumento (por ejemplo el mensaje) se interpreta
// como comando.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';

const isWindows = process.platform === 'win32';

// carpeta global de npm (npm i -g): npm run la expone; si se corre con node directo, la de por defecto
function npmGlobalPrefix() {
  const prefix = process.env.npm_config_global_prefix ?? process.env.npm_config_prefix;
  if (prefix) return prefix;
  return isWindows ? join(process.env.APPDATA ?? '', 'npm') : dirname(dirname(process.execPath));
}

// eas-cli instalado global: se corre su bin/run con este mismo node (en Windows eas es un .cmd,
// que Node no lanza sin shell)
function easEntry() {
  const modules = isWindows ? join(npmGlobalPrefix(), 'node_modules') : join(npmGlobalPrefix(), 'lib', 'node_modules');
  const entry = join(modules, 'eas-cli', 'bin', 'run');
  if (!existsSync(entry)) throw new Error(`No se encontró eas-cli en ${entry}: instálalo con npm i -g eas-cli`);
  return entry;
}

export function runEas(args, options = {}) {
  return execFileSync(process.execPath, [easEntry(), ...args], options);
}

// ssh del sistema (OpenSSH); DEPLOY_SSH_BIN permite otra ruta absoluta
function sshPath() {
  const custom = process.env.DEPLOY_SSH_BIN;
  const candidates = custom
    ? [custom]
    : isWindows
      ? [join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'OpenSSH', 'ssh.exe')]
      : ['/usr/bin/ssh', '/usr/local/bin/ssh', '/opt/homebrew/bin/ssh'];
  const found = candidates.find((path) => isAbsolute(path) && existsSync(path));
  if (!found) throw new Error(`No se encontró ssh en ${candidates.join(', ')}: define DEPLOY_SSH_BIN con su ruta absoluta`);
  return found;
}

export function runSsh(args, options = {}) {
  return execFileSync(sshPath(), args, options);
}
