import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface SectionCardProps {
  title?: string;
  icon?: IconName;
  // elemento a la derecha del título (una etiqueta de estado, un contador...)
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

// tarjeta blanca con borde (".card" de la web) y título opcional con ícono
export function SectionCard({ title, icon, right, style, children }: SectionCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {title ? (
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {icon ? <MaterialIcons name={icon} size={20} color={colors.primary} /> : null}
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          </View>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flexShrink: 1, fontSize: fontSize.cardTitle, fontWeight: fontWeight.bold },
});
