import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean; // Botón de confirmar en rojo
  onConfirm: () => void;
  onCancel: () => void;
}

// Diálogo de confirmación (por ejemplo, antes de eliminar algo)
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttons}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: danger ? colors.error : colors.primary }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    card: { gap: 10, padding: 20, borderRadius: 22, backgroundColor: colors.card },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    message: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
    buttons: { flexDirection: 'row', gap: 12, marginTop: 8 },
    button: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    cancelButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    cancelText: { fontSize: 14, fontWeight: '700', color: colors.text },
    confirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  });
