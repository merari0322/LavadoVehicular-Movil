import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform } from 'react-native';

import { API_BASE_URL } from '../../core/api/config';
import {
  PublishedApk,
  downloadUrlOf,
  fetchPublishedApk,
  isNewerThanInstalled,
  siteUrlOf,
} from '../../core/services/appUpdates/publishedApk';
import { AppAlert } from '../../shared/components/feedback/AppAlert';

/**
 * Avisos de actualización al abrir la app. No pinta nada.
 * 1. APK nuevo: si el servidor publicó un versionCode mayor al instalado, ofrece descargarlo (hace
 *    falta para cambios nativos: permisos, paquetes, ícono).
 * 2. EAS Update: los cambios solo de pantallas y lógica se bajan solos al abrir la app; cuando uno
 *    queda listo, ofrece reiniciar para verlo ya (si no, se aplica la próxima vez que se abra).
 * Si hay un APK nuevo, solo se avisa eso: la actualización por internet no aplica entre versiones.
 */
export function AppUpdatesCheck() {
  const { t } = useTranslation();
  const { isUpdatePending } = Updates.useUpdates();
  const [newerApk, setNewerApk] = useState<PublishedApk | null>(null);
  const asked = useRef({ apk: false, ota: false });
  const siteUrl = siteUrlOf(API_BASE_URL);

  // 1. ¿hay un APK más nuevo publicado? (solo en el APK instalado: Expo Go y la web no tienen versionCode)
  useEffect(() => {
    if (Platform.OS !== 'android' || !Application.nativeBuildVersion) return;
    let cancelled = false;
    void fetchPublishedApk(siteUrl).then((published) => {
      if (cancelled || !isNewerThanInstalled(published, Application.nativeBuildVersion) || !published) return;
      setNewerApk(published);
    });
    return () => {
      cancelled = true;
    };
  }, [siteUrl]);

  useEffect(() => {
    if (!newerApk || asked.current.apk) return;
    asked.current.apk = true;
    AppAlert.alert(
      t('APP_UPDATE.NEW_VERSION_TITLE'),
      newerApk.notes ? `${t('APP_UPDATE.NEW_VERSION_MESSAGE')}\n\n${newerApk.notes}` : t('APP_UPDATE.NEW_VERSION_MESSAGE'),
      [
        { text: t('APP_UPDATE.LATER'), style: 'cancel' },
        { text: t('APP_UPDATE.DOWNLOAD'), onPress: () => void Linking.openURL(downloadUrlOf(newerApk, siteUrl)) },
      ],
      { type: 'info', icon: 'system-update' },
    );
  }, [newerApk, siteUrl, t]);

  // 2. una actualización por internet (EAS Update) ya se bajó: ofrecer verla ahora
  useEffect(() => {
    if (!Updates.isEnabled || !isUpdatePending || newerApk || asked.current.ota) return;
    asked.current.ota = true;
    AppAlert.alert(
      t('APP_UPDATE.READY_TITLE'),
      t('APP_UPDATE.READY_MESSAGE'),
      [
        { text: t('APP_UPDATE.LATER'), style: 'cancel' },
        { text: t('APP_UPDATE.RESTART'), onPress: () => void Updates.reloadAsync().catch(() => undefined) },
      ],
      { type: 'success', icon: 'auto-awesome' },
    );
  }, [isUpdatePending, newerApk, t]);

  return null;
}
