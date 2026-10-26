import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { NOTIFICATION_TEXTS } from '../../constants/notificationTexts';
import { NOTIFICATION_TABS, NotificationTab } from '../../models/notifications';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface NotificationTabsProps {
  active: NotificationTab;
  unreadByTab: Record<NotificationTab, number>;
  onChange: (tab: NotificationTab) => void;
}

// Icono de cada pestaña
const TAB_ICONS: Record<NotificationTab, IconName> = {
  all: 'mail',
  reminder: 'schedule',
  promotion: 'local-offer',
  confirmation: 'check-circle',
  other: 'notifications',
};

// Pestañas por categoría con el contador de notificaciones sin leer
export function NotificationTabs({ active, unreadByTab, onChange }: NotificationTabsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {NOTIFICATION_TABS.map((tab) => {
        const isActive = tab === active;
        const color = isActive ? colors.text : colors.textSecondary;
        const unread = unreadByTab[tab];

        return (
          <Pressable
            key={tab}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab)}
          >
            <MaterialIcons name={TAB_ICONS[tab]} size={20} color={color} />
            <Text style={[styles.tabText, { color }]}>{NOTIFICATION_TEXTS.tabs[tab]}</Text>
            {unread > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    scroll: {
      flexGrow: 0,
      borderRadius: 16,
      backgroundColor: withAlpha(colors.textMuted, 0.12),
    },
    container: { gap: 4, padding: 6 },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
    },
    tabActive: { backgroundColor: colors.card },
    tabText: { fontSize: 14, fontWeight: '700' },
    badge: {
      minWidth: 24,
      alignItems: 'center',
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: 999,
      backgroundColor: withAlpha(colors.primary, 0.18),
    },
    badgeText: { fontSize: 12, fontWeight: '700', color: colors.primaryHover },
  });
