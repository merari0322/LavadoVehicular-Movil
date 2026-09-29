import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { OperatorsSummary } from '../../models/operator';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface SummaryCardProps {
  label: string;
  value: string;
  suffix?: string; // Texto pequeño junto al valor (ej. "/5.0")
  note: string;
  noteColor?: string;
  icon: IconName;
  accent: string;
}

// Tarjeta individual del resumen
function SummaryCard({ label, value, suffix, note, noteColor, icon, accent }: SummaryCardProps) {
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
      <Text style={styles.value}>
        {value}
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </Text>
      <Text style={[styles.note, noteColor ? { color: noteColor } : null]}>{note}</Text>
    </View>
  );
}

// Cuadrícula de 2x2 con el resumen del equipo
export function OperatorsSummaryCards({ summary }: { summary: OperatorsSummary }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const texts = OPERATOR_TEXTS.summary;

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <SummaryCard
          label={texts.staff}
          value={String(summary.total)}
          note={texts.staffDetail(summary.hired, summary.interns)}
          icon="badge"
          accent={colors.primary}
        />
        <SummaryCard
          label={texts.availableToday}
          value={String(summary.available)}
          note={texts.availableDetail(summary.available)}
          icon="check-circle"
          accent={colors.primaryHover}
        />
      </View>
      <View style={styles.row}>
        <SummaryCard
          label={texts.weeklyServices}
          value={String(summary.weeklyServices)}
          note={texts.trend(summary.servicesTrend)}
          noteColor={colors.primaryHover}
          icon="directions-car"
          accent={colors.primary}
        />
        <SummaryCard
          label={texts.rating}
          value={summary.averageRating.toFixed(1)}
          suffix="/5.0"
          note={texts.ratingBase(summary.totalReviews)}
          icon="star"
          accent={colors.warning}
        />
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
      gap: 4,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
    label: { flex: 1, fontSize: 12, color: colors.textSecondary },
    iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    value: { fontSize: 32, fontWeight: '800', color: colors.text },
    suffix: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
    note: { fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  });
