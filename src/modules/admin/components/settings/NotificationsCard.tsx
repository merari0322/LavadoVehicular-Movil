import React, { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import {
  NOTIFICATION_PREFERENCE_KEYS,
  NotificationPreferenceKey,
  NotificationPreferences,
} from '../../models/settings';
import { SettingsSectionCard } from './SettingsSectionCard';

interface NotificationsCardProps {
  preferences: NotificationPreferences;
  onToggle: (key: NotificationPreferenceKey) => void;
}

const texts = SETTINGS_TEXTS.general.notifications;

// Tarjeta con los interruptores de preferencias de notificaciones
export function NotificationsCard({ preferences, onToggle }: NotificationsCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SettingsSectionCard icon="notifications" title={texts.title}>
      {NOTIFICATION_PREFERENCE_KEYS.map((key, index) => (
        <View key={key} style={[styles.row, index > 0 && styles.rowBorder]}>
          <View style={styles.flex}>
            <Text style={styles.itemTitle}>{texts.items[key].title}</Text>
            <Text style={styles.itemDescription}>{texts.items[key].description}</Text>
          </View>
          <Switch
            value={preferences[key]}
            onValueChange={() => onToggle(key)}
            trackColor={{ false: withAlpha(colors.textMuted, 0.35), true: colors.primaryHover }}
            thumbColor={colors.onPrimary}
          />
        </View>
      ))}
    </SettingsSectionCard>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
    rowBorder: { paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
    itemTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
    itemDescription: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
  });
