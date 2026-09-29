import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import {
  AppLanguage,
  HelpTopic,
  NotificationPreferenceKey,
  NotificationPreferences,
  ThemeId,
} from '../../models/settings';
import { AppearanceCard } from './AppearanceCard';
import { HelpCard } from './HelpCard';
import { NotificationsCard } from './NotificationsCard';

interface GeneralTabProps {
  preferences: NotificationPreferences;
  theme: ThemeId;
  language: AppLanguage;
  onTogglePreference: (key: NotificationPreferenceKey) => void;
  onChangeTheme: (theme: ThemeId) => void;
  onChangeLanguage: (language: AppLanguage) => void;
  onOpenHelp: (topic: HelpTopic) => void;
}

// Pestaña general: notificaciones, ayuda y apariencia
export function GeneralTab({
  preferences,
  theme,
  language,
  onTogglePreference,
  onChangeTheme,
  onChangeLanguage,
  onOpenHelp,
}: GeneralTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.iconBox}>
          <MaterialIcons name="settings" size={24} color={colors.primary} />
        </View>
        <Text style={styles.title}>{SETTINGS_TEXTS.title}</Text>
      </View>

      <NotificationsCard preferences={preferences} onToggle={onTogglePreference} />
      <HelpCard onOpen={onOpenHelp} />
      <AppearanceCard
        theme={theme}
        language={language}
        onChangeTheme={onChangeTheme}
        onChangeLanguage={onChangeLanguage}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 16 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    title: { fontSize: 24, fontWeight: '800', color: colors.text },
  });
