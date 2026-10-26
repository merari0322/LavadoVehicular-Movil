import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { DASHBOARD_TEXTS } from '../../constants/dashboardTexts';
import { RevenueDay } from '../../types/dashboard.types';
import { formatCOP } from '../../viewmodels/useAdminDashboardViewModel';
import { CardLink } from './CardLink';

interface RevenueChartProps {
  data: RevenueDay[];
  weekTotal: number;
  busiestDay: string;
  barHeightPct: (amount: number) => number;
  onViewReport: () => void;
}

const CHART_HEIGHT = 160;

export function RevenueChart({ data, weekTotal, busiestDay, barHeightPct, onViewReport }: RevenueChartProps) {
  const { colors } = useTheme();
  const texts = DASHBOARD_TEXTS.revenue;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.titleRow}>
        <MaterialIcons name="bar-chart" size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{texts.subtitle}</Text>

      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>{texts.total}</Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCOP(weekTotal)} COP</Text>
      </View>

      <View style={[styles.bars, { height: CHART_HEIGHT }]}>
        {data.map((d) => (
          <View key={d.day} style={styles.barCol}>
            <Text style={[styles.barTag, { color: d.isToday ? colors.primary : colors.textSecondary }]}>{d.label}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  { height: `${barHeightPct(d.amount)}%`, backgroundColor: d.isToday ? colors.primary : colors.primarySoft },
                ]}
              />
            </View>
            <Text
              style={[
                styles.barDay,
                { color: d.isToday ? colors.text : colors.textSecondary, fontWeight: d.isToday ? '700' : '400' },
              ]}
            >
              {d.day}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.footerText, { color: colors.textSecondary }]}>{texts.busiest(busiestDay)}</Text>
      <CardLink label={texts.viewReport} onPress={onViewReport} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '700' },
  subtitle: { fontSize: 11, marginTop: 2, marginBottom: 12 },
  totalRow: { alignItems: 'flex-end', marginBottom: 12 },
  totalLabel: { fontSize: 11 },
  totalValue: { fontSize: 16, fontWeight: '700' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  barCol: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  barTag: { fontSize: 9, fontWeight: '600', marginBottom: 4 },
  barTrack: { width: '100%', flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '70%', borderRadius: 6, minHeight: 4 },
  barDay: { fontSize: 10, marginTop: 4 },
  footerText: { fontSize: 11, marginTop: 12 },
});
