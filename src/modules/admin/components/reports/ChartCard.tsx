import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { REPORT_TEXTS } from '../../constants/reportTexts';
import { ChartPoint, ReportPeriod } from '../../models/reports';
import { PeriodToggle } from './PeriodToggle';
import { ReportsChart } from './ReportsChart';

interface ChartCardProps {
  period: ReportPeriod;
  points: ChartPoint[];
  onChangePeriod: (period: ReportPeriod) => void;
}

// Tarjeta de gráficas: título, selector de periodo y gráfica de barras
export function ChartCard({ period, points, onChangePeriod }: ChartCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <MaterialIcons name="trending-up" size={22} color={colors.primary} />
        <Text style={styles.title}>{REPORT_TEXTS.chart.title}</Text>
      </View>

      <PeriodToggle active={period} onChange={onChangePeriod} />
      <Text style={styles.subtitle}>{REPORT_TEXTS.chart.subtitle}</Text>

      <ReportsChart points={points} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      gap: 14,
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 14, color: colors.textSecondary },
  });
