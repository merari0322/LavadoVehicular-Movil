import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../theme';
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
 * Avisos de actualización al abrir la app.
 * 1. APK nuevo: si el servidor publicó un versionCode mayor al instalado, la app queda bloqueada
 *    con una pantalla que solo deja descargarlo. Es obligatorio: los cambios nativos (permisos,
 *    paquetes, ícono) y los arreglos que dependen de ellos no llegan de otra forma.
 * 2. EAS Update: los cambios solo de pantallas y lógica se bajan solos al abrir la app; cuando uno
 *    queda listo, ofrece reiniciar para verlo ya (si no, se aplica la próxima vez que se abra).
 * Si hay un APK nuevo, solo se avisa eso: la actualización por internet no aplica entre versiones.
 */
export function AppUpdatesCheck() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isUpdatePending } = Updates.useUpdates();
  const [newerApk, setNewerApk] = useState<PublishedApk | null>(null);
  const asked = useRef({ ota: false });
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

  if (!newerApk) return null;

  // 1. APK obligatorio: no se cierra con el botón atrás; solo queda descargarlo
  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.icon, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="system-update" size={44} color={colors.onPrimary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{t('APP_UPDATE.REQUIRED_TITLE')}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{t('APP_UPDATE.NEW_VERSION_MESSAGE')}</Text>
        {newerApk.notes ? (
          <View style={[styles.notes, { borderColor: colors.border }]}>
            <Text style={[styles.message, { color: colors.text }]}>{newerApk.notes}</Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => void Linking.openURL(downloadUrlOf(newerApk, siteUrl))}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
        >
          <MaterialIcons name="file-download" size={22} color={colors.onPrimary} />
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{t('APP_UPDATE.DOWNLOAD')}</Text>
        </Pressable>
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('APP_UPDATE.REQUIRED_HINT')}</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  icon: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.pageTitle, fontWeight: fontWeight.bold, textAlign: 'center' },
  message: { fontSize: fontSize.body, lineHeight: 21, textAlign: 'center' },
  notes: { alignSelf: 'stretch', borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  buttonText: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
  hint: { fontSize: fontSize.caption, textAlign: 'center' },
});
