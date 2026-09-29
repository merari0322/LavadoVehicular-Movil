import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { withAlpha } from '../../../../shared/utils/color';
import { PAYMENT_TEXTS } from '../../constants/paymentTexts';
import { PaymentMethod, PaymentStatus } from '../../models/payment';

// Etiqueta de color según el estado del pago
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { colors } = useTheme();

  const palette: Record<PaymentStatus, { background: string; text: string }> = {
    pending: { background: colors.warningSoft, text: colors.warning },
    approved: { background: colors.successSoft, text: colors.success },
    rejected: { background: colors.errorSoft, text: colors.error },
  };

  const { background, text } = palette[status];

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.text, { color: text }]}>{PAYMENT_TEXTS.status[status]}</Text>
    </View>
  );
}

// Etiqueta con el método de pago (Nequi, Efectivo, etc.)
export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.badge, { backgroundColor: withAlpha(colors.primary, 0.15) }]}>
      <Text style={[styles.text, { color: colors.primaryHover }]}>{PAYMENT_TEXTS.methods[method]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999 },
  text: { fontSize: 12, fontWeight: '700' },
});
