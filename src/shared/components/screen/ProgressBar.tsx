import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fontSize, fontWeight, useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';

interface ProgressBarProps {
  // 0 a 100
  percentage: number;
  // texto a la izquierda; a la derecha se muestra el porcentaje (o rightText si se pasa)
  label?: string;
  rightText?: string;
}

// barra de avance (".progress-bar" de la web)
export function ProgressBar({ percentage, label, rightText }: ProgressBarProps) {
  const { colors } = useTheme();
  const value = Math.max(0, Math.min(100, percentage));

  return (
    <View style={styles.container}>
      {label !== undefined ? (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{rightText ?? `${Math.round(value)}%`}</Text>
        </View>
      ) : null}
      <View style={[styles.track, { backgroundColor: withAlpha(colors.primary, 0.15) }]}>
        <View style={[styles.fill, { width: `${value}%`, backgroundColor: colors.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  label: { flex: 1, fontSize: fontSize.small },
  value: { fontSize: fontSize.small, fontWeight: fontWeight.bold },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
