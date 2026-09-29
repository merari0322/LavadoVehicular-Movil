import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/theme';
import { ThemeColors } from '../../app/theme/colors';

interface CheckboxFieldProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

// Casilla de verificación con texto
export function CheckboxField({ checked, label, onChange }: CheckboxFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable style={styles.row} onPress={() => onChange(!checked)} hitSlop={6}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <MaterialIcons name="check" size={16} color={colors.onPrimary} /> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    box: {
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.textMuted,
      backgroundColor: colors.card,
    },
    boxChecked: { borderColor: colors.primary, backgroundColor: colors.primary },
    label: { flexShrink: 1, fontSize: 14, color: colors.text },
  });
