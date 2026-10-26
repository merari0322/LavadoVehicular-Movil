import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { NOTIFICATION_TEXTS } from '../../constants/notificationTexts';

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

// Encabezado: título, contador de sin leer y botón para marcar todo como leído
export function NotificationsHeader({ unreadCount, onMarkAllRead }: NotificationsHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const hasUnread = unreadCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{NOTIFICATION_TEXTS.title}</Text>
        {hasUnread ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{NOTIFICATION_TEXTS.unreadBadge(unreadCount)}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.subtitle}>{NOTIFICATION_TEXTS.subtitle}</Text>

      <Pressable
        style={[styles.markAllButton, !hasUnread && styles.disabled]}
        onPress={onMarkAllRead}
        disabled={!hasUnread}
      >
        <MaterialIcons name="done-all" size={20} color={colors.text} />
        <Text style={styles.markAllText}>{NOTIFICATION_TEXTS.markAllRead}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 10 },
    titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
    title: { fontSize: 26, fontWeight: '800', color: colors.text },
    badge: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    badgeText: { fontSize: 12, fontWeight: '700', color: colors.onPrimary },
    subtitle: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
    markAllButton: {
      height: 46,
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    markAllText: { fontSize: 14, fontWeight: '700', color: colors.text },
    disabled: { opacity: 0.45 },
  });
