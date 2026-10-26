import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { REPORT_TEXTS } from '../../constants/reportTexts';
import { REPORT_PERIODS, ReportPeriod } from '../../models/reports';

interface PeriodToggleProps {
  active: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
}

// Selector segmentado: Día / Semana / Mes
export function PeriodToggle({ active, onChange }: PeriodToggleProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {REPORT_PERIODS.map((period) => {
        const isActive = period === active;

        return (
          <Pressable
            key={period}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => onChange(period)}
          >
            <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
              {REPORT_TEXTS.periods[period]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      gap: 4,
      padding: 4,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.08),
    },
    option: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
    optionActive: { backgroundColor: colors.primary },
    optionText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    optionTextActive: { color: colors.onPrimary },
  });
