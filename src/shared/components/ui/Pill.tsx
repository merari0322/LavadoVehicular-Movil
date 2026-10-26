import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { withAlpha } from '../../utils/color';

type IconName = keyof typeof MaterialIcons.glyphMap;

// Etiqueta de color (estado, tipo, contador...)
export type PillTone = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface PillProps {
  label: string;
  tone?: PillTone;
  icon?: IconName;
}

export function Pill({ label, tone = 'neutral', icon }: PillProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const palette: Record<PillTone, { background: string; text: string }> = {
    primary: { background: withAlpha(colors.primary, 0.15), text: colors.primaryHover },
    success: { background: colors.successSoft, text: colors.success },
    warning: { background: colors.warningSoft, text: colors.warning },
    error: { background: colors.errorSoft, text: colors.error },
    neutral: { background: withAlpha(colors.textMuted, 0.18), text: colors.textSecondary },
  };

  const { background, text } = palette[tone];

  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      {icon ? <MaterialIcons name={icon} size={14} color={text} /> : null}
      <Text style={[styles.pillText, { color: text }]}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 999,
    },
    pillText: { fontSize: 12, fontWeight: '700' },
  });
