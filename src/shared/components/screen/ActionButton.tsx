import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius, useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';

type IconName = keyof typeof MaterialIcons.glyphMap;

// primary: relleno de color · outline: borde · soft: fondo suave · danger: rojo · link: solo texto
export type ActionVariant = 'primary' | 'outline' | 'soft' | 'danger' | 'link';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  // el ícono va después del texto (ej. "Reservar ahora →")
  iconRight?: boolean;
  variant?: ActionVariant;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}

// botón de las pantallas de cliente y operario (btn-primary / btn-outline de la web)
export function ActionButton({
  label,
  onPress,
  icon,
  iconRight = false,
  variant = 'primary',
  disabled = false,
  loading = false,
  small = false,
  style,
}: ActionButtonProps) {
  const { colors } = useTheme();

  const palette: Record<ActionVariant, { background: string; border: string; text: string }> = {
    primary: { background: colors.primary, border: colors.primary, text: colors.onPrimary },
    outline: { background: 'transparent', border: colors.primary, text: colors.primary },
    soft: { background: withAlpha(colors.primary, 0.12), border: 'transparent', text: colors.primary },
    danger: { background: colors.errorSoft, border: 'transparent', text: colors.error },
    link: { background: 'transparent', border: 'transparent', text: colors.textSecondary },
  };
  const { background, border, text } = palette[variant];
  const isDisabled = disabled || loading;

  const iconNode = icon ? <MaterialIcons name={icon} size={small ? 16 : 18} color={text} /> : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        small && styles.small,
        { backgroundColor: background, borderColor: border, opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} />
      ) : (
        <>
          {!iconRight && iconNode}
          <Text style={[styles.label, small && styles.smallLabel, { color: text }]}>{label}</Text>
          {iconRight && iconNode}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  small: { minHeight: 36, paddingHorizontal: 12, borderRadius: radius.sm },
  label: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
  smallLabel: { fontSize: fontSize.caption },
});
