import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { REPORT_TEXTS } from '../../constants/reportTexts';
import { formatCurrency } from '../../utils/reportUtils';

interface TotalRevenueCardProps {
  revenue: number;
}

// Tarjeta con los ingresos totales del año
export function TotalRevenueCard({ revenue }: TotalRevenueCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <MaterialIcons name="attach-money" size={28} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.label}>{REPORT_TEXTS.yearlyRevenue}</Text>
        <Text style={styles.value}>{formatCurrency(revenue)}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    iconBox: {
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    label: { fontSize: 14, color: colors.textSecondary },
    value: { marginTop: 2, fontSize: 30, fontWeight: '800', color: colors.primary },
  });
