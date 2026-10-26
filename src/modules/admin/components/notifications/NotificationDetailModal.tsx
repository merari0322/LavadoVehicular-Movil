import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { NOTIFICATION_TEXTS } from '../../constants/notificationTexts';
import { AppNotification } from '../../models/notifications';
import { formatDateTime } from '../../utils/notificationUtils';
import { Pill } from '../../../../shared/components/ui/Pill';
import { CATEGORY_ICON, CATEGORY_TONE, getToneColor } from './notificationVisuals';
import { ModalCloseButton } from '../../../../shared/components/feedback/ModalCloseButton';
import { ModalShell } from '../../../../shared/components/feedback/ModalShell';

interface NotificationDetailModalProps {
  notification: AppNotification | null; // null = modal cerrado
  onClose: () => void;
  // botón "Ir a..." hacia el apartado de donde viene el aviso (si no viene, solo "Cerrar")
  goToLabel?: string;
  onGoTo?: () => void;
}

const texts = NOTIFICATION_TEXTS.detail;

// Modal de solo lectura con el detalle de una notificación
export function NotificationDetailModal({ notification, onClose, goToLabel, onGoTo }: NotificationDetailModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ModalShell visible={notification !== null} onRequestClose={onClose} onBackdropPress={onClose}>
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
            <ModalCloseButton onPress={onClose} />
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

          <View style={styles.buttons}>
            {goToLabel && onGoTo ? (
              <>
                <Pressable style={[styles.closeButton, styles.secondaryButton]} onPress={onClose}>
                  <Text style={[styles.closeText, { color: colors.text }]}>{NOTIFICATION_TEXTS.common.close}</Text>
                </Pressable>
                <Pressable style={[styles.closeButton, styles.goButton]} onPress={onGoTo} accessibilityRole="button">
                  <Text style={styles.closeText}>{goToLabel}</Text>
                  <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>{NOTIFICATION_TEXTS.common.close}</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : null}
    </ModalShell>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sheet: {
      gap: 14,
      padding: 20,
      borderRadius: 24,
      backgroundColor: colors.card,
    },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
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
    buttons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10 },
    secondaryButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    goButton: { flexDirection: 'row', gap: 6 },
  });
