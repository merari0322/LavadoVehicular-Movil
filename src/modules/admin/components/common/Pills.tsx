import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';

type IconName = keyof typeof MaterialIcons.glyphMap;

// Hook: colores y estilos del tema activo
const useStyles = () => {
  const { colors } = useTheme();
  return { colors, styles: useMemo(() => createStyles(colors), [colors]) };
};

// ---------------------------------------------------------------
// Etiqueta de color (estado, tipo, contador...)
// ---------------------------------------------------------------

export type PillTone = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface PillProps {
  label: string;
  tone?: PillTone;
  icon?: IconName;
}

export function Pill({ label, tone = 'neutral', icon }: PillProps) {
  const { colors, styles } = useStyles();

  const palette: Record<PillTone, { background: string; text: string }> = {
    primary: { background: withAlpha(colors.primary, 0.15), text: colors.primaryHover },
    success: { background: colors.successSoft, text: colors.success },
    warning: { background: colors.warningSoft, text: colors.warning },
    error: { background: colors.errorSoft, text: colors.error },
    neutral: { background: withAlpha(colors.textMuted, 0.18), text: colors.textSecondary },
  };

  const { background, text } = palette[tone];

  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      {icon ? <MaterialIcons name={icon} size={14} color={text} /> : null}
      <Text style={[styles.pillText, { color: text }]}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------
// Botón cuadrado con icono (editar, eliminar)
// ---------------------------------------------------------------

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  danger?: boolean;
}

export function IconButton({ icon, onPress, danger = false }: IconButtonProps) {
  const { colors, styles } = useStyles();

  return (
    <Pressable style={styles.iconButton} onPress={onPress} hitSlop={4}>
      <MaterialIcons name={icon} size={20} color={danger ? colors.error : colors.textSecondary} />
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 999,
    },
    pillText: { fontSize: 12, fontWeight: '700' },
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
