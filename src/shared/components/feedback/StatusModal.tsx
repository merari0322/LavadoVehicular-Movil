import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';
import { DialogCard, DialogTone } from './DialogCard';
import { ModalShell } from './ModalShell';

type IconName = keyof typeof MaterialIcons.glyphMap;

export interface StatusDetail {
  label: string;
  value: string;
}

// lo que se muestra en el modal (textos ya traducidos)
export interface StatusModalData {
  type?: 'success' | 'error' | 'info';
  icon?: IconName;
  title: string;
  message?: string;
  details?: StatusDetail[];
  buttonText?: string;
  // botón extra (ej. "Ir al historial"): cierra el modal y hace la acción
  action?: { label: string; icon?: IconName; onPress: () => void };
}

interface StatusModalProps {
  // null = cerrado
  data: StatusModalData | null;
  onClose: () => void;
}

const DEFAULT_ICON: Record<NonNullable<StatusModalData['type']>, IconName> = {
  success: 'check-circle',
  error: 'error-outline',
  info: 'info-outline',
};

const TONE: Record<NonNullable<StatusModalData['type']>, DialogTone> = {
  success: 'success',
  error: 'danger',
  info: 'primary',
};

// modal de éxito / error / información con lista opcional de detalles (StatusModal de la web)
export function StatusModal({ data, onClose }: StatusModalProps) {
  const { colors } = useTheme();
  const type = data?.type ?? 'success';

  return (
    <ModalShell visible={data !== null} onRequestClose={onClose} onBackdropPress={onClose} padding={spacing.xl}>
      <DialogCard
        tone={TONE[type]}
        icon={data?.icon ?? DEFAULT_ICON[type]}
        title={data?.title ?? ''}
        message={data?.message}
        actions={
          data?.action
            ? [
                { label: data.buttonText ?? 'OK', onPress: onClose, kind: 'cancel' },
                {
                  label: data.action.label,
                  icon: data.action.icon,
                  kind: 'confirm',
                  onPress: () => {
                    const run = data.action?.onPress;
                    onClose();
                    run?.();
                  },
                },
              ]
            : [{ label: data?.buttonText ?? 'OK', onPress: onClose, kind: 'confirm' }]
        }
      >
        {data?.details && data.details.length > 0 ? (
          <ScrollView
            style={[styles.details, { backgroundColor: withAlpha(colors.textMuted, 0.1) }]}
            contentContainerStyle={styles.detailsContent}
          >
            {data.details.map((detail, index) => (
              <View
                key={detail.label}
                style={[styles.detailRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{detail.label}</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{detail.value}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </DialogCard>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  details: { alignSelf: 'stretch', maxHeight: 260, marginTop: spacing.sm, borderRadius: radius.lg, flexGrow: 0 },
  detailsContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 10 },
  detailLabel: { fontSize: fontSize.small },
  detailValue: { flexShrink: 1, fontSize: fontSize.small, fontWeight: fontWeight.bold, textAlign: 'right' },
});
