import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { SCHEDULE_TEXTS } from '../../constants/scheduleTexts';
import { SCHEDULE_TABS, ScheduleTab } from '../../models/schedule';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface ScheduleTabsProps {
  active: ScheduleTab;
  activeBays: number;
  onChange: (tab: ScheduleTab) => void;
}

// Icono de cada pestaña
const TAB_ICONS: Record<ScheduleTab, IconName> = {
  hours: 'event',
  bays: 'directions-car',
};

// Pestañas: horario del negocio y bahías de lavado
export function ScheduleTabs({ active, activeBays, onChange }: ScheduleTabsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {SCHEDULE_TABS.map((tab) => {
        const isActive = tab === active;
        const color = isActive ? colors.primaryHover : colors.textSecondary;
        const badge = tab === 'hours' ? SCHEDULE_TEXTS.weeklyBadge : SCHEDULE_TEXTS.activeBays(activeBays);

        return (
          <Pressable
            key={tab}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab)}
          >
            <MaterialIcons name={TAB_ICONS[tab]} size={20} color={color} />
            <Text style={[styles.tabText, { color }]} numberOfLines={1}>
              {SCHEDULE_TEXTS.tabs[tab]}
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: isActive ? withAlpha(colors.primary, 0.18) : withAlpha(colors.textMuted, 0.18) },
              ]}
            >
              <Text style={[styles.badgeText, { color }]}>{badge}</Text>
            </View>
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
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: colors.primary },
    tabText: { fontSize: 14, fontWeight: '700' },
    badge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999 },
    badgeText: { fontSize: 11, fontWeight: '700' },
  });
