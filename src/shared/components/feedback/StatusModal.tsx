import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';
import { ActionButton } from '../screen/ActionButton';

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

// modal de éxito / error / información con lista opcional de detalles (StatusModal de la web)
export function StatusModal({ data, onClose }: StatusModalProps) {
  const { colors } = useTheme();
  const type = data?.type ?? 'success';
  const color = type === 'error' ? colors.error : type === 'info' ? colors.primary : colors.success;

  return (
    <Modal visible={data !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.iconCircle, { backgroundColor: withAlpha(color, 0.15) }]}>
            <MaterialIcons name={data?.icon ?? DEFAULT_ICON[type]} size={34} color={color} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{data?.title}</Text>
          {data?.message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{data.message}</Text> : null}

          {data?.details && data.details.length > 0 ? (
            <ScrollView style={[styles.details, { borderColor: colors.border }]} contentContainerStyle={styles.detailsContent}>
              {data.details.map((detail) => (
                <View key={detail.label} style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{detail.label}</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{detail.value}</Text>
                </View>
              ))}
            </ScrollView>
          ) : null}

          <ActionButton label={data?.buttonText ?? 'OK'} onPress={onClose} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: spacing.xl, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  card: { alignItems: 'center', gap: spacing.sm, padding: 22, borderRadius: radius.xl, maxHeight: '85%' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontSize: fontSize.cardTitle + 1, fontWeight: fontWeight.extrabold, textAlign: 'center' },
  message: { fontSize: fontSize.body, lineHeight: 20, textAlign: 'center' },
  details: { alignSelf: 'stretch', marginTop: 6, borderWidth: 1, borderRadius: radius.md, flexGrow: 0 },
  detailsContent: { padding: spacing.md, gap: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  detailLabel: { fontSize: fontSize.small },
  detailValue: { flexShrink: 1, fontSize: fontSize.small, fontWeight: fontWeight.bold, textAlign: 'right' },
  button: { alignSelf: 'stretch', marginTop: 8 },
});
