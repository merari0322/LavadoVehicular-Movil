import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';
import { ActionButton } from './ActionButton';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  // botón opcional a la derecha (ej. "Registrar vehículo")
  actionLabel?: string;
  actionIcon?: IconName;
  onAction?: () => void;
}

// título de cada página, igual que el h1 + párrafo de la web
export function PageHeader({ title, subtitle, icon, actionLabel, actionIcon, onAction }: PageHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {icon ? (
          <View style={[styles.iconBox, { backgroundColor: withAlpha(colors.primary, 0.15) }]}>
            <MaterialIcons name={icon} size={24} color={colors.primary} />
          </View>
        ) : null}
        <View style={styles.texts}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {actionLabel && onAction ? (
        <ActionButton label={actionLabel} icon={actionIcon} onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, marginTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: { width: 48, height: 48, borderRadius: radius.md + 2, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1 },
  title: { fontSize: fontSize.pageTitle, fontWeight: fontWeight.extrabold },
  subtitle: { marginTop: 4, fontSize: fontSize.body, lineHeight: 20 },
});
