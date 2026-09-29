import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  danger?: boolean;
}

// Botón cuadrado con icono (editar, eliminar)
export function IconButton({ icon, onPress, danger = false }: IconButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable style={styles.iconButton} onPress={onPress} hitSlop={4}>
      <MaterialIcons name={icon} size={20} color={danger ? colors.error : colors.textSecondary} />
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    iconButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
  });
