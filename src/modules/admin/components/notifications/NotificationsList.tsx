import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { NOTIFICATION_TEXTS } from '../../constants/notificationTexts';
import { AppNotification } from '../../models/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationsListProps {
  notifications: AppNotification[];
  hasFilters: boolean; // Cambia el mensaje del estado vacío
  onToggleRead: (id: string) => void;
  onView: (notification: AppNotification) => void;
  onDelete: (notification: AppNotification) => void;
}

// Lista de notificaciones con su estado vacío
export function NotificationsList({
  notifications,
  hasFilters,
  onToggleRead,
  onView,
  onDelete,
}: NotificationsListProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (notifications.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{NOTIFICATION_TEXTS.empty}</Text>
        <Text style={styles.emptyHint}>
          {hasFilters ? NOTIFICATION_TEXTS.emptyFilteredHint : NOTIFICATION_TEXTS.emptyHint}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.map((item) => (
        <NotificationItem
          key={item.id}
          notification={item}
          onToggleRead={() => onToggleRead(item.id)}
          onView={() => onView(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 12 },
    empty: { alignItems: 'center', gap: 4, paddingVertical: 32 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    emptyHint: { fontSize: 13, color: colors.textSecondary },
  });
