import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';

type IconName = keyof typeof MaterialIcons.glyphMap;
export type StatTone = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface StatTileProps {
  value: string | number;
  label: string;
  icon?: IconName;
  tone?: StatTone;
  // número rojo sobre el ícono (ej. notificaciones sin leer)
  badge?: number;
  onPress?: () => void;
}

// tarjeta de estadística (".stat-card" de la web): ícono, número grande y texto.
// Van de a dos por fila: se ponen dentro de <StatGrid>.
export function StatTile({ value, label, icon, tone = 'primary', badge = 0, onPress }: StatTileProps) {
  const { colors } = useTheme();

  const toneColor: Record<StatTone, string> = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    neutral: colors.textSecondary,
  };
  const color = toneColor[tone];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {icon ? (
        <View>
          <View style={[styles.iconBox, { backgroundColor: withAlpha(color, 0.15) }]}>
            <MaterialIcons name={icon} size={20} color={color} />
          </View>
          {badge > 0 ? (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <Text style={[styles.value, { color: icon ? colors.text : color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

// fila que acomoda las tarjetas de estadística de a dos
export function StatGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  card: { flexBasis: '48%', gap: 6, padding: 14, borderRadius: radius.lg, borderWidth: 1 },
  iconBox: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -6,
    left: 28,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#ffffff', fontSize: fontSize.tiny, fontWeight: fontWeight.bold },
  value: { fontSize: fontSize.statValue, fontWeight: fontWeight.bold },
  label: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
});
