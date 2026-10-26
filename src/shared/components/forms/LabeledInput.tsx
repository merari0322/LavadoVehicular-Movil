import React, { useMemo, useState } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { withAlpha } from '../../utils/color';

interface LabeledInputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string; // Ayuda debajo del campo (se oculta mientras hay error)
  prefix?: string; // Texto fijo antes del valor (ej. "$")
  containerStyle?: StyleProp<ViewStyle>;
}

// Input de formulario: etiqueta + campo + mensaje de error (o ayuda)
export function LabeledInput({
  label,
  required = false,
  error,
  hint,
  prefix,
  containerStyle,
  multiline = false,
  style,
  ...inputProps
}: LabeledInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // borde de color al escribir y aspecto atenuado si no se puede editar: así un campo
  // habilitado no se confunde con uno bloqueado
  const [focused, setFocused] = useState(false);
  const disabled = inputProps.editable === false;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? ' *' : ''}
        </Text>
      ) : null}

      <View
        style={[
          styles.box,
          multiline && styles.boxMultiline,
          focused && styles.boxFocused,
          Boolean(error) && styles.boxError,
          disabled && styles.boxDisabled,
        ]}
      >
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          multiline={multiline}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, multiline && styles.inputMultiline, style]}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
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
    boxFocused: { borderColor: colors.primary },
    boxError: { borderColor: colors.error },
    boxDisabled: { opacity: 0.55 },
    prefix: { marginRight: 6, fontSize: 14, color: colors.textSecondary },
    input: { flex: 1, height: 46, fontSize: 14, color: colors.text },
    inputMultiline: { height: 76, paddingTop: 12, textAlignVertical: 'top' },
    error: { marginTop: 4, fontSize: 12, fontWeight: '600', color: colors.error },
    hint: { marginTop: 4, fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  });
