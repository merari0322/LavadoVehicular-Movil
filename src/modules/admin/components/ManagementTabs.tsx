import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { MANAGEMENT_TEXTS } from '../constants/managementTexts';
import { MANAGEMENT_TABS, ManagementTab } from '../models/management';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface ManagementTabsProps {
  active: ManagementTab;
  onChange: (tab: ManagementTab) => void;
}

// Icono de cada pestaña
const TAB_ICONS: Record<ManagementTab, IconName> = {
  users: 'group',
  roles: 'verified-user',
  services: 'build',
  promotions: 'local-offer',
};

// Barra de pestañas con desplazamiento horizontal y estado del sistema
export function ManagementTabs({ active, onChange }: ManagementTabsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {MANAGEMENT_TABS.map((tab) => {
          const isActive = tab === active;
          const color = isActive ? colors.primaryHover : colors.textSecondary;

          return (
            <Pressable
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onChange(tab)}
            >
              <MaterialIcons name={TAB_ICONS[tab]} size={20} color={color} />
              <Text style={[styles.tabText, { color }]}>{MANAGEMENT_TEXTS.tabs[tab]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.statusRow}>
        <View style={styles.dot} />
        <Text style={styles.statusText}>{MANAGEMENT_TEXTS.online}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: { gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
    tabs: { gap: 6 },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: colors.primary },
    tabText: { fontSize: 15, fontWeight: '700' },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 8, paddingHorizontal: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryHover },
    statusText: { fontSize: 12, color: colors.textSecondary },
  });
