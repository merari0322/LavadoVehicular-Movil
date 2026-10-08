import React, { useMemo } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';

type IconName = keyof typeof MaterialIcons.glyphMap;

// ---------------------------------------------------------------
// Estilos compartidos por las piezas de este archivo
// ---------------------------------------------------------------

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Tarjeta
    card: {
      padding: 16,
      gap: 4,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    cardHighlighted: { borderWidth: 2, borderColor: colors.primary },
    // Etiqueta
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
    // Botón de icono
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
    // Encabezado de sección
    header: { gap: 4 },
    title: { fontSize: 22, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 13, color: colors.textSecondary },
    action: {
      height: 46,
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    actionText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
    // Estado vacío
    empty: { alignItems: 'center', gap: 6, paddingVertical: 32 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    emptyHint: { fontSize: 13, color: colors.textSecondary },
  });

const useStyles = () => {
  const { colors } = useTheme();
  return { colors, styles: useMemo(() => createStyles(colors), [colors]) };
};

// ---------------------------------------------------------------
// Tarjeta base de cada registro
// ---------------------------------------------------------------

interface ManagementCardProps {
  highlighted?: boolean; // Borde de color (promoción destacada)
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function ManagementCard({ highlighted = false, style, children }: ManagementCardProps) {
  const { styles } = useStyles();
  return <View style={[styles.card, highlighted && styles.cardHighlighted, style]}>{children}</View>;
}

// ---------------------------------------------------------------
// Etiqueta de color (estado, rol, permiso, etc.)
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
// Botón cuadrado con icono (editar, eliminar, pausar...)
// ---------------------------------------------------------------

interface ActionIconButtonProps {
  icon: IconName;
  onPress: () => void;
  danger?: boolean;
}

export function ActionIconButton({ icon, onPress, danger = false }: ActionIconButtonProps) {
  const { colors, styles } = useStyles();

  return (
    <Pressable style={styles.iconButton} onPress={onPress} hitSlop={4}>
      <MaterialIcons name={icon} size={20} color={danger ? colors.error : colors.textSecondary} />
    </Pressable>
  );
}

// ---------------------------------------------------------------
// Encabezado de cada pestaña: título, descripción y botón principal
// ---------------------------------------------------------------

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  // sin acción: encabezados como el de Roles, que ya no tienen un "+ Crear" (ADR-015, los 3
  // roles son fijos)
  actionLabel?: string;
  actionIcon?: IconName;
  onAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, actionIcon, onAction }: SectionHeaderProps) {
  const { colors, styles } = useStyles();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {onAction && actionIcon && actionLabel ? (
        <Pressable style={styles.action} onPress={onAction}>
          <MaterialIcons name={actionIcon} size={20} color={colors.onPrimary} />
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------
// Mensaje cuando una lista está vacía
// ---------------------------------------------------------------

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  const { colors, styles } = useStyles();

  return (
    <View style={styles.empty}>
      <MaterialIcons name="search" size={36} color={withAlpha(colors.textMuted, 0.8)} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyHint}>{hint}</Text>
    </View>
  );
}
