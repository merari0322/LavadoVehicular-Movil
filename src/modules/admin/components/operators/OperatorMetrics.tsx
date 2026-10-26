import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { Operator } from '../../models/operator';
import { formatCurrency } from '../../utils/paymentUtils';
import { useOperatorMetrics } from '../../viewmodels/useOperatorMetrics';

const texts = OPERATOR_TEXTS.metrics;

// Cuadrícula de 2x2 con las métricas reales de la semana del operario (operations-service)
export function OperatorMetrics({ operator }: { operator: Operator }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const metrics = useOperatorMetrics(operator.id);
  const occupied = metrics?.occupancyPercent ?? 0;
  const trend = metrics?.servicesTrendPercent;

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {/* Servicios de la semana */}
        <View style={styles.card}>
          <Text style={styles.label}>{texts.services}</Text>
          <Text style={styles.value}>
            {metrics ? metrics.completedServices : '—'} <Text style={styles.unit}>{texts.servicesUnit}</Text>
          </Text>
          <Text style={[styles.note, { color: colors.primaryHover }]}>
            {trend == null ? texts.noTrend : texts.trend(trend)}
          </Text>
        </View>

        {/* Horas disponibles con barra de progreso */}
        <View style={styles.card}>
          <Text style={styles.label}>{texts.hours}</Text>
          <Text style={styles.value}>
            {metrics ? metrics.workedHours : '—'} <Text style={styles.unit}>{texts.hoursOf(metrics ? metrics.availableHours : 0)}</Text>
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
          <Text style={styles.value}>{metrics?.punctualityPercent != null ? `${metrics.punctualityPercent}%` : '—'}</Text>
          <Text style={styles.note}>{texts.punctualityLevel[metrics?.punctualityLevel ?? 'NO_DATA']}</Text>
        </View>

        {/* Ingresos generados */}
        <View style={styles.card}>
          <Text style={styles.label}>{texts.revenue}</Text>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(metrics?.revenue ?? 0)} <Text style={styles.unit}>COP</Text>
          </Text>
          <Text style={[styles.note, { color: colors.primaryHover }]}>{texts.revenueNote}</Text>
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
