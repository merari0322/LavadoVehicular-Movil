import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { withAlpha } from '../../../shared/utils/color';
import { TEXTS } from '../constants/reservationTexts';
import { ReservationStatsData } from '../models/reservation';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface StatCardProps {
  label: string;
  value: number;
  icon: IconName;
  accent: string;
  badge?: string;
}

interface ReservationStatsProps {
  stats: ReservationStatsData;
}

// Tarjeta individual de estadística
function StatCard({ label, value, icon, accent, badge }: StatCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.iconBox, { backgroundColor: withAlpha(accent, 0.16) }]}>
          <MaterialIcons name={icon} size={20} color={accent} />
        </View>
      </View>

      <Text style={styles.value}>{value}</Text>

      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.warningSoft }]}>
          <Text style={[styles.badgeText, { color: colors.warning }]}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

// Cuadrícula de 2x2 con las estadísticas del día
export function ReservationStats({ stats }: ReservationStatsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatCard label={TEXTS.stats.total} value={stats.total} icon="assignment" accent={colors.primary} />
        <StatCard label={TEXTS.stats.active} value={stats.active} icon="autorenew" accent={colors.primary} />
      </View>
      <View style={styles.row}>
        <StatCard
          label={TEXTS.stats.unassigned}
          value={stats.unassigned}
          icon="warning"
          accent={colors.warning}
          badge={stats.unassigned > 0 ? TEXTS.stats.attention : undefined}
        />
        <StatCard label={TEXTS.stats.cancelled} value={stats.cancelled} icon="close" accent={colors.textSecondary} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    grid: { gap: 12 },
    row: { flexDirection: 'row', gap: 12 },
    card: {
      flex: 1,
      minHeight: 118,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
    label: { flex: 1, fontSize: 12, color: colors.textSecondary },
    iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    value: { marginTop: 4, fontSize: 32, fontWeight: '800', color: colors.text },
    badge: { alignSelf: 'flex-start', marginTop: 6, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999 },
    badgeText: { fontSize: 11, fontWeight: '700' },
  });
