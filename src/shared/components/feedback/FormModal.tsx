import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { withAlpha } from '../../utils/color';
import { ModalCloseButton } from './ModalCloseButton';
import { ModalShell } from './ModalShell';

interface FormModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  cancelLabel: string;
  submitLabel: string;
  submitDisabled?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}

// Estructura base de los modales de formulario: encabezado + campos + botones
export function FormModal({
  visible,
  title,
  subtitle,
  cancelLabel,
  submitLabel,
  submitDisabled = false,
  onClose,
  onSubmit,
  children,
}: FormModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ModalShell visible={visible} onRequestClose={onClose} keyboardAvoiding>
      <View style={styles.sheet}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={[styles.accent, { backgroundColor: colors.primary }]} />
          <View style={styles.flex}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <ModalCloseButton onPress={onClose} />
        </View>

        {/* Campos */}
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {/* Botones */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.submitButton,
              submitDisabled && styles.disabled,
              pressed && styles.pressed,
            ]}
            onPress={onSubmit}
            disabled={submitDisabled}
          >
            <Text style={styles.submitText}>{submitLabel}</Text>
          </Pressable>
        </View>
      </View>
    </ModalShell>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    sheet: {
      maxHeight: '92%',
      borderRadius: 28,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: withAlpha(colors.primary, 0.14),
      backgroundColor: colors.card,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      paddingTop: 22,
      paddingHorizontal: 20,
      paddingBottom: spacing.lg,
      backgroundColor: withAlpha(colors.primary, 0.06),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    // franja de color arriba del encabezado
    accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
    title: { fontSize: fontSize.cardTitle + 2, fontWeight: fontWeight.extrabold, color: colors.text },
    subtitle: { marginTop: 4, fontSize: fontSize.small, lineHeight: 18, color: colors.textSecondary },
    body: { flexShrink: 1 },
    bodyContent: { gap: 14, padding: 20 },
    footer: {
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: { flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg },
    cancelButton: { backgroundColor: withAlpha(colors.textMuted, 0.16) },
    cancelText: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold, color: colors.text },
    submitButton: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    submitText: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold, color: colors.onPrimary },
    disabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  });
