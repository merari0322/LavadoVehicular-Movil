import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { maskTime } from '../../utils/reservationUtils';

interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

// Campo de hora en formato 24 h: al escribir 0730 se convierte en 07:30
export function TimeField({ label, value, onChange, disabled = false, hasError = false, containerStyle }: TimeFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, hasError && styles.inputError, disabled && styles.inputDisabled]}
        value={value}
        onChangeText={(text) => onChange(maskTime(text))}
        placeholder="hh:mm"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={5}
        editable={!disabled}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    label: { marginBottom: 4, fontSize: 12, color: colors.textSecondary },
    input: {
      height: 44,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.1),
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    inputError: { borderColor: colors.error },
    inputDisabled: { opacity: 0.45 },
  });
