import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { NOTIFICATION_TEXTS } from '../../constants/notificationTexts';
import { AppNotification } from '../../models/notifications';
import { formatDateTime } from '../../utils/notificationUtils';
import { IconButton } from '../../../../shared/components/ui/IconButton';
import { Pill } from '../../../../shared/components/ui/Pill';
import { CATEGORY_ICON, CATEGORY_TONE, getToneColor } from './notificationVisuals';

interface NotificationItemProps {
  notification: AppNotification;
  onToggleRead: () => void;
  onView: () => void;
  onDelete: () => void;
}

const texts = NOTIFICATION_TEXTS.item;

// Tarjeta de una notificación: contenido, fecha y acciones (leer, detalle, eliminar)
export function NotificationItem({ notification, onToggleRead, onView, onDelete }: NotificationItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { category, read } = notification;
  const toneColor = getToneColor(colors, CATEGORY_TONE[category]);

  return (
    <View style={[styles.card, !read && styles.cardUnread]}>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: withAlpha(toneColor, 0.15) }]}>
          <MaterialIcons name={CATEGORY_ICON[category]} size={24} color={toneColor} />
        </View>

        <View style={styles.flex}>
          {/* Título con punto de "sin leer" */}
          <View style={styles.titleRow}>
            {!read ? <View style={styles.dot} /> : null}
            <Text style={styles.title}>{notification.title}</Text>
          </View>
          <Pill label={NOTIFICATION_TEXTS.categories[category]} tone={CATEGORY_TONE[category]} />
          <Text style={styles.message}>{notification.message}</Text>
          <Text style={styles.date}>{formatDateTime(notification.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {/* Marcar como leído / no leído */}
        <Pressable
          style={[styles.button, read ? styles.outlineButton : styles.filledButton]}
          onPress={onToggleRead}
        >
          <MaterialIcons
            name={read ? 'mail' : 'done-all'}
            size={18}
            color={read ? colors.text : colors.onPrimary}
          />
          <Text style={[styles.buttonText, { color: read ? colors.text : colors.onPrimary }]} numberOfLines={1}>
            {read ? texts.markUnread : texts.markRead}
          </Text>
        </Pressable>

        <Pressable style={[styles.button, styles.outlineButton]} onPress={onView}>
          <MaterialIcons name="visibility" size={18} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]} numberOfLines={1}>
            {texts.viewDetail}
          </Text>
        </Pressable>

        <IconButton icon="delete" danger onPress={onDelete} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1, gap: 6 },
    card: {
      gap: 14,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    // Las no leídas se resaltan con el color principal
    cardUnread: {
      borderColor: withAlpha(colors.primary, 0.45),
      backgroundColor: withAlpha(colors.primary, 0.12),
    },
    topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    iconBox: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
    title: { flexShrink: 1, fontSize: 16, fontWeight: '800', color: colors.text },
    message: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
    date: { fontSize: 13, color: colors.textSecondary },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    button: {
      flex: 1,
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 8,
      borderRadius: 10,
    },
    filledButton: { backgroundColor: colors.primary },
    outlineButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    buttonText: { flexShrink: 1, fontSize: 13, fontWeight: '700' },
  });
