import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { REPORT_TEXTS } from '../../constants/reportTexts';
import { PeriodSummary } from '../../models/reports';
import { formatCurrency } from '../../utils/reportUtils';

interface PeriodSummaryCardsProps {
  summaries: PeriodSummary[];
}

// Tarjetas de resumen: una por periodo (día, semana y mes)
export function PeriodSummaryCards({ summaries }: PeriodSummaryCardsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {summaries.map((item) => (
        <View key={item.period} style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{REPORT_TEXTS.summaryTitles[item.period]}</Text>
            <View style={styles.iconBox}>
              <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.label}>
            {REPORT_TEXTS.servicesDone}: <Text style={styles.strong}>{item.services}</Text>
          </Text>
          <Text style={styles.label}>
            {REPORT_TEXTS.totalRevenue}: <Text style={styles.money}>{formatCurrency(item.revenue)}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 12 },
    card: {
      gap: 6,
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 17, fontWeight: '800', color: colors.text },
    iconBox: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    label: { fontSize: 15, color: colors.textSecondary },
    strong: { fontWeight: '800', color: colors.text },
    money: { fontWeight: '800', color: colors.primary },
  });
