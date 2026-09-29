import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';

interface ReservationFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

// Contenedor de un campo del formulario: etiqueta + contenido + mensaje de error
export function ReservationField({ label, required = false, error, style, children }: ReservationFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={style}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    label: { marginBottom: 6, fontSize: 13, fontWeight: '500', color: colors.textSecondary },
    error: { marginTop: 4, fontSize: 12, fontWeight: '600', color: colors.error },
  });
