import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';

interface StatCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconTone?: 'primary' | 'warning';
  badgeText: string;
  badgeTone?: 'success' | 'warning';
  value: string | number;
  label: string;
}

export function StatCard({ icon, iconTone = 'primary', badgeText, badgeTone = 'success', value, label }: StatCardProps) {
  const { colors } = useTheme();
  const iconBg = iconTone === 'warning' ? colors.warningSoft : colors.primarySoft;
  const iconColor = iconTone === 'warning' ? colors.warning : colors.primary;
  const badgeBg = badgeTone === 'warning' ? colors.warningSoft : colors.successSoft;
  const badgeColor = badgeTone === 'warning' ? colors.warning : colors.success;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.top}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]} numberOfLines={1}>
            {badgeText}
          </Text>
        </View>
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexBasis: '48%', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, maxWidth: '55%' },
  badgeText: { fontSize: 10, fontWeight: '600' },
  value: { fontSize: 26, fontWeight: '700', marginBottom: 2 },
  label: { fontSize: 11, fontWeight: '600' },
});
