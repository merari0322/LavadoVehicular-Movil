import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';
import { ActionButton } from './ActionButton';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
  // muestra un indicador de carga en lugar del ícono
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

// mensaje cuando una lista está vacía, cargando o falló
export function EmptyState({ icon = 'inbox', title, subtitle, loading = false, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <View style={[styles.iconBox, { backgroundColor: withAlpha(colors.primary, 0.12) }]}>
          <MaterialIcons name={icon} size={30} color={colors.primary} />
        </View>
      )}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      {actionLabel && onAction ? <ActionButton label={actionLabel} onPress={onAction} variant="outline" small /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 28,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  iconBox: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold, textAlign: 'center' },
  subtitle: { fontSize: fontSize.small, textAlign: 'center' },
});
