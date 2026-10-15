import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';

interface ModalCloseButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

// botón redondo de cerrar (X) del encabezado de los modales
export function ModalCloseButton({ onPress, disabled = false }: ModalCloseButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: withAlpha(colors.textMuted, pressed ? 0.28 : 0.16), opacity: disabled ? 0.4 : 1 },
      ]}
    >
      <MaterialIcons name="close" size={20} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
