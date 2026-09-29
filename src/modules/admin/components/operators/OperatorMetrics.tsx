import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { Operator } from '../../models/operator';
import { formatPercent } from '../../utils/managementUtils';
import { formatCurrency } from '../../utils/paymentUtils';

const texts = OPERATOR_TEXTS.metrics;

// Cuadrícula de 2x2 con las métricas semanales del operario
export function OperatorMetrics({ operator }: { operator: Operator }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { stats } = operator;
  const occupied = stats.capacityHours > 0 ? Math.round((stats.usedHours / stats.capacityHours) * 100) : 0;

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {/* Servicios de la semana */}
        <View style={styles.card}>
          <Text style={styles.label}>{texts.services}</Text>
          <Text style={styles.value}>
            {operator.weeklyServices} <Text style={styles.unit}>{texts.servicesUnit}</Text>
          </Text>
          <Text style={[styles.note, { color: colors.primaryHover }]}>
            {OPERATOR_TEXTS.summary.trend(stats.servicesTrend)}
          </Text>
        </View>

        {/* Horas disponibles con barra de progreso */}
        <View style={styles.card}>
          <Text style={styles.label}>{texts.hours}</Text>
          <Text style={styles.value}>
            {stats.usedHours} <Text style={styles.unit}>{texts.hoursOf(stats.capacityHours)}</Text>
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(occupied, 100)}%` }]} />
          </View>
          <Text style={styles.note}>{texts.occupied(occupied)}</Text>
        </View>
      </View>

      <View style={styles.row}>
        {/* Puntualidad */}
        <View style={styles.card}>
          <Text style={styles.label}>{texts.punctuality}</Text>
          <Text style={styles.value}>{formatPercent(stats.punctuality)}</Text>
          <Text style={styles.note}>{texts.punctualityNote}</Text>
        </View>

        {/* Ingresos generados */}
        <View style={styles.card}>
          <Text style={styles.label}>{texts.revenue}</Text>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(stats.revenue)} <Text style={styles.unit}>COP</Text>
          </Text>
          <Text style={[styles.note, { color: colors.primaryHover }]}>{texts.goal(stats.goalPercent)}</Text>
        </View>
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
    label: { fontSize: 12, color: colors.textSecondary },
    value: { fontSize: 26, fontWeight: '800', color: colors.text },
    unit: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
    note: { fontSize: 12, lineHeight: 17, color: colors.textSecondary },
    track: {
      height: 8,
      marginVertical: 4,
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: withAlpha(colors.textMuted, 0.2),
    },
    fill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  });
