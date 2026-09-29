import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { NOTIFICATION_TEXTS } from '../../constants/notificationTexts';
import { AppNotification } from '../../models/notifications';
import { formatDateTime } from '../../utils/notificationUtils';
import { Pill } from '../../../../shared/components/ui/Pill';
import { CATEGORY_ICON, CATEGORY_TONE, getToneColor } from './notificationVisuals';

interface NotificationDetailModalProps {
  notification: AppNotification | null; // null = modal cerrado
  onClose: () => void;
}

const texts = NOTIFICATION_TEXTS.detail;

// Modal de solo lectura con el detalle de una notificación
export function NotificationDetailModal({ notification, onClose }: NotificationDetailModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={notification !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {notification ? (
          <View style={styles.sheet}>
            {/* Encabezado: icono, categoría y título */}
            <View style={styles.header}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: withAlpha(
                      getToneColor(colors, CATEGORY_TONE[notification.category]),
                      0.15,
                    ),
                  },
                ]}
              >
                <MaterialIcons
                  name={CATEGORY_ICON[notification.category]}
                  size={26}
                  color={getToneColor(colors, CATEGORY_TONE[notification.category])}
                />
              </View>
              <View style={styles.headerText}>
                <Pill
                  label={NOTIFICATION_TEXTS.categories[notification.category]}
                  tone={CATEGORY_TONE[notification.category]}
                />
                <Text style={styles.title}>{notification.title}</Text>
              </View>
            </View>

            <Text style={styles.message}>{notification.message}</Text>

            {/* Fecha y estado de lectura */}
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{formatDateTime(notification.createdAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons
                name={notification.read ? 'drafts' : 'mark-email-unread'}
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>{notification.read ? texts.read : texts.unread}</Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>{NOTIFICATION_TEXTS.common.close}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
      gap: 14,
      padding: 20,
      borderRadius: 24,
      backgroundColor: colors.card,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: {
      width: 52,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
    },
    headerText: { flex: 1, gap: 6 },
    title: { fontSize: 20, fontWeight: '800', color: colors.text },
    message: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: withAlpha(colors.textMuted, 0.12),
    },
    infoText: { fontSize: 15, color: colors.text },
    closeButton: {
      height: 44,
      alignSelf: 'flex-end',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    closeText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
  });
