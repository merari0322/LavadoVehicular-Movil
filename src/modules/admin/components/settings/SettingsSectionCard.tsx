import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface SettingsSectionCardProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// Tarjeta con icono y título que agrupa una sección de la configuración
export function SettingsSectionCard({ icon, title, subtitle, children }: SettingsSectionCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <MaterialIcons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.body}>{children}</View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    card: {
      gap: 14,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    subtitle: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    body: { gap: 12 },
  });
