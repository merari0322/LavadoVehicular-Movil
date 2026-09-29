import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { SelectField, SelectOption } from './SelectField';

interface LabeledSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

// Selector desplegable con etiqueta arriba y mensaje de error abajo
export function LabeledSelect({ label, value, options, onChange, error, containerStyle }: LabeledSelectProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <SelectField value={value} options={options} onChange={onChange} hasError={Boolean(error)} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    label: { marginBottom: 6, fontSize: 13, fontWeight: '500', color: colors.textSecondary },
    error: { marginTop: 4, fontSize: 12, fontWeight: '600', color: colors.error },
  });
