# LavaRápido — aplicación móvil

App Android de LavaRápido para los tres roles: el cliente reserva, paga y califica; el operario
ve y ejecuta sus servicios; el administrador gestiona usuarios, catálogo, horarios, operarios,
reservas, pagos, reportes y el informe de inspección del vehículo con fotos.

Stack: Expo SDK 57 · React Native 0.86 · React 19 · TypeScript · React Navigation 7.

## Cómo correrla

Necesita el backend arriba (`docker compose --profile app up -d` desde `lavarapido-infra`).
La app habla solo con el API Gateway (puerto 8080), igual que la web.

```bash
npm install
npx expo start            # escanear el QR con Expo Go (mismo wifi que el computador)
npm run android           # emulador de Android
npm run web               # navegador, en http://localhost:8081
npx tsc --noEmit          # revisión de tipos
```

Con Expo Go la app usa sola la IP del computador que corre Expo; el firewall de Windows debe dejar
pasar el puerto 8080. Las notificaciones push no llegan a Expo Go en Android: hace falta un build
de desarrollo o el APK.

## Variables (opcionales)

Copiar `.env.example` a `.env.local` (no se sube) y reiniciar con `npx expo start --clear`.

| Variable | Para qué |
|---|---|
| `EXPO_PUBLIC_API_URL` | Fijar a mano la dirección del gateway (`http://<IP>:8080/api/v1`; emulador: `10.0.2.2`) |
| `EXPO_PUBLIC_WEB_URL` | Dirección de la web, para el enlace público del informe de inspección |
| `EXPO_PUBLIC_<SERVICIO>_API_URL` | Depurar un microservicio directo, sin el gateway |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | Id del proyecto de EAS para recibir notificaciones push |

## Estructura

```
src/
├── app/          configuración, proveedores y tema
├── core/         api (cliente HTTP, configuración), navigation, services (llamadas por microservicio), storage
├── modules/      auth · client · operator · admin, cada uno con screens, components, viewmodels y constants
└── shared/       componentes comunes (feedback, forms, screen, ui), i18n, layouts, hooks y validadores
```

Los textos visibles están en español, inglés, francés y portugués (`localized({ es, en, fr, pt })`).

## Publicar una versión

| Comando | Cuándo |
|---|---|
| `eas build --profile preview --platform android` y luego `npm run publish:apk -- "qué cambió"` | Cambios nativos (paquetes, permisos, ícono): APK nuevo en `/app/LavaRapidoVehicular.apk` del servidor |
| `npm run publish:update -- "qué cambió"` | Solo pantallas y lógica: actualización por internet (EAS Update) a los APK del canal preview |

Los perfiles de compilación están en `eas.json` (`preview` y `production`).

## Proyecto LavaRápido

Este repositorio es parte de LavaRápido (Vehicle Washing), proyecto formativo del Tecnólogo en
Análisis y Desarrollo de Software (ADSO), ficha 3145556, SENA Regional Huila.

| Recurso | Enlace |
|---|---|
| Documentación y manuales (ES/EN, MD · PDF · Word) | [lavarapido-docs](https://github.com/BrayanCABRERA123/lavarapido-docs#readme) |
| Manual técnico | [09_MANUALES/ES/MD/manual-tecnico.md](https://github.com/BrayanCABRERA123/lavarapido-docs/blob/main/09_MANUALES/ES/MD/manual-tecnico.md) |
| Manual de instalación | [09_MANUALES/ES/MD/manual-de-instalacion.md](https://github.com/BrayanCABRERA123/lavarapido-docs/blob/main/09_MANUALES/ES/MD/manual-de-instalacion.md) |
| Levantar todo el sistema | [lavarapido-infra](https://github.com/BrayanCABRERA123/lavarapido-infra) (`docker compose --profile app up -d`) |
| Aplicación desplegada | https://lavarapidovehicular.northcentralus.cloudapp.azure.com |

**Ramas y commits:** se trabaja en `develop` con ramas `feature/`, `fix/` y `docs/` que se
fusionan con `git merge --no-ff`; los commits siguen Conventional Commits
(`feat(scope): ...`, `fix(scope): ...`). Detalle en la
[guía de git del equipo](https://github.com/BrayanCABRERA123/lavarapido-docs#guía-de-git-del-equipo).

**Equipo:** Brayan Estiven Patiño Cabrera, Juan Camilo Guilombo Osorio y Merari Urbano Quintero.
