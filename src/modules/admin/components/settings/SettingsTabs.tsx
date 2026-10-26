import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import { SETTINGS_TABS, SettingsTab } from '../../models/settings';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface SettingsTabsProps {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

// Icono de cada pestaña
const TAB_ICONS: Record<SettingsTab, IconName> = {
  general: 'tune',
  business: 'business',
  payments: 'payments',
};

// Pestañas: general, datos del negocio y métodos de pago
export function SettingsTabs({ active, onChange }: SettingsTabsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {SETTINGS_TABS.map((tab) => {
        const isActive = tab === active;
        const color = isActive ? colors.primaryHover : colors.textSecondary;

        return (
          <Pressable
            key={tab}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab)}
          >
            <MaterialIcons name={TAB_ICONS[tab]} size={20} color={color} />
            <Text style={[styles.tabText, { color }]} numberOfLines={1}>
              {SETTINGS_TEXTS.tabs[tab]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
    tab: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: colors.primary },
    tabText: { fontSize: 13, fontWeight: '700' },
  });
