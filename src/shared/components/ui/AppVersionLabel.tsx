import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';
import Constants from 'expo-constants';

import { fontSize, spacing, useTheme } from '../../../app/theme';

/**
 * Versión de la app (MAYOR.MENOR.PARCHE, la "version" de app.json). Sale de la configuración que
 * trae la actualización en uso, así también sube con las actualizaciones por internet (EAS Update)
 * y no solo con un APK nuevo. Se cambia con npm run version:patch | version:minor | version:major.
 */
export function AppVersionLabel() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const version = Constants.expoConfig?.version;
  if (!version) return null;
  return <Text style={[styles.label, { color: colors.textMuted }]}>{t('CONFIG.APP_VERSION', { version })}</Text>;
}

const styles = StyleSheet.create({
  label: { fontSize: fontSize.caption, textAlign: 'center', marginTop: spacing.md },
});
