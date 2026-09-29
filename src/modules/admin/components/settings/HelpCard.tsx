import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import { HELP_TOPICS, HelpTopic } from '../../models/settings';
import { SettingsSectionCard } from './SettingsSectionCard';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface HelpCardProps {
  onOpen: (topic: HelpTopic) => void;
}

const texts = SETTINGS_TEXTS.general.help;

// Icono de cada opción de ayuda
const TOPIC_ICONS: Record<HelpTopic, IconName> = {
  helpCenter: 'help',
  terms: 'description',
  privacy: 'security',
};

// Tarjeta de ayuda: centro de ayuda, términos y política de datos
export function HelpCard({ onOpen }: HelpCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SettingsSectionCard icon="help-outline" title={texts.title}>
      {HELP_TOPICS.map((topic, index) => (
        <View key={topic} style={[styles.row, index > 0 && styles.rowBorder]}>
          <MaterialIcons name={TOPIC_ICONS[topic]} size={22} color={colors.textSecondary} />
          <Text style={[styles.label, styles.flex]} numberOfLines={1}>
            {texts.items[topic]}
          </Text>
          <Pressable style={styles.openButton} onPress={() => onOpen(topic)}>
            <Text style={styles.openText}>{texts.open}</Text>
            <MaterialIcons name="chevron-right" size={18} color={colors.text} />
          </Pressable>
        </View>
      ))}
    </SettingsSectionCard>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 2 },
    rowBorder: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
    label: { fontSize: 15, fontWeight: '600', color: colors.text },
    openButton: {
      height: 38,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingLeft: 14,
      paddingRight: 8,
      borderRadius: 10,
      backgroundColor: withAlpha(colors.textMuted, 0.12),
    },
    openText: { fontSize: 14, fontWeight: '600', color: colors.text },
  });
