import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useTheme } from '../../app/theme';
import { ThemeColors } from '../../app/theme/colors';
import { withAlpha } from '../utils/color';

interface LabeledInputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  prefix?: string; // Texto fijo antes del valor (ej. "$")
  containerStyle?: StyleProp<ViewStyle>;
}

// Input de formulario: etiqueta + campo + mensaje de error
export function LabeledInput({
  label,
  required = false,
  error,
  prefix,
  containerStyle,
  multiline = false,
  style,
  ...inputProps
}: LabeledInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? ' *' : ''}
        </Text>
      ) : null}

      <View style={[styles.box, multiline && styles.boxMultiline, Boolean(error) && styles.boxError]}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          {...inputProps}
          multiline={multiline}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, multiline && styles.inputMultiline, style]}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    label: { marginBottom: 6, fontSize: 13, fontWeight: '500', color: colors.textSecondary },
    box: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.1),
    },
    boxMultiline: { alignItems: 'flex-start' },
    boxError: { borderColor: colors.error },
    prefix: { marginRight: 6, fontSize: 14, color: colors.textSecondary },
    input: { flex: 1, height: 46, fontSize: 14, color: colors.text },
    inputMultiline: { height: 76, paddingTop: 12, textAlignVertical: 'top' },
    error: { marginTop: 4, fontSize: 12, fontWeight: '600', color: colors.error },
  });
