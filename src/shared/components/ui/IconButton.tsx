import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  danger?: boolean;
  // lo que dice el lector de pantalla (MOV-15); editar y eliminar ya traen el suyo
  label?: string;
}

// nombre de los íconos que se usan solos, para el lector de pantalla
const DEFAULT_LABELS: Partial<Record<IconName, string>> = { edit: 'COMMON.EDIT', delete: 'COMMON.DELETE' };

// Botón cuadrado con icono (editar, eliminar)
export function IconButton({ icon, onPress, danger = false, label }: IconButtonProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const defaultLabel = DEFAULT_LABELS[icon];

  return (
    <Pressable
      style={styles.iconButton}
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label ?? (defaultLabel ? t(defaultLabel) : undefined)}
    >
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
