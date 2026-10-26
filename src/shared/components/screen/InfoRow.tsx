import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, useTheme } from '../../../app/theme';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface InfoRowProps {
  label: string;
  value: string;
  icon?: IconName;
  // valor resaltado (ej. el total)
  strong?: boolean;
}

// fila "etiqueta ........ valor" de los resúmenes y detalles
export function InfoRow({ label, value, icon, strong = false }: InfoRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {icon ? <MaterialIcons name={icon} size={16} color={colors.textMuted} /> : null}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: strong ? colors.primary : colors.text }, strong && styles.strong]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  label: { fontSize: fontSize.small },
  value: { flexShrink: 1, fontSize: fontSize.small, fontWeight: fontWeight.semibold, textAlign: 'right' },
  strong: { fontSize: fontSize.cardTitle, fontWeight: fontWeight.extrabold },
});
