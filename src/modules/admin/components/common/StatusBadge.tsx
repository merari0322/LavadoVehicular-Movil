import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { withAlpha } from '../../../../shared/utils/color';
import { TEXTS } from '../../constants/reservationTexts';
import { ReservationStatus } from '../../models/reservation';

// Etiqueta de color según el estado de la reserva
export function StatusBadge({ status }: { status: ReservationStatus }) {
  const { colors } = useTheme();

  const palette: Record<ReservationStatus, { background: string; text: string }> = {
    scheduled: { background: colors.warningSoft, text: colors.warning },
    confirmed: { background: withAlpha(colors.primary, 0.15), text: colors.primary },
    in_progress: { background: colors.successSoft, text: colors.success },
    completed: { background: withAlpha(colors.textMuted, 0.18), text: colors.textSecondary },
    cancelled: { background: colors.errorSoft, text: colors.error },
    no_show: { background: colors.errorSoft, text: colors.error },
    rescheduled: { background: colors.warningSoft, text: colors.warning },
  };

  const { background, text } = palette[status];

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.text, { color: text }]}>{TEXTS.status[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999 },
  text: { fontSize: 12, fontWeight: '700' },
});
