import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { PAYMENT_TEXTS } from '../../constants/paymentTexts';
import { Payment, PaymentStatus } from '../../models/payment';
import { formatCOP, formatDateTime } from '../../utils/paymentUtils';
import { PaymentMethodBadge, PaymentStatusBadge } from './PaymentBadges';

interface PaymentCardProps {
  payment: Payment;
  onOpen: (payment: Payment) => void; // Revisar, ver recibo o ver motivo
}

// Texto del botón de acción según el estado
const ACTION_LABEL: Record<PaymentStatus, string> = {
  pending: PAYMENT_TEXTS.list.review,
  approved: PAYMENT_TEXTS.list.receipt,
  rejected: PAYMENT_TEXTS.list.reason,
};

// Tarjeta de un pago (en móvil reemplaza a la fila de la tabla)
export function PaymentCard({ payment, onOpen }: PaymentCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isPending = payment.status === 'pending';
  const isRejected = payment.status === 'rejected';

  return (
    <View style={styles.card}>
      {/* Cliente y estado */}
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text style={styles.customer}>{payment.customerName}</Text>
          <Text style={styles.secondary}>{payment.phone || '-'}</Text>
        </View>
        <PaymentStatusBadge status={payment.status} />
      </View>

      <View style={styles.divider} />

      {/* Código, referencia y método */}
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text style={styles.strong}>{payment.code}</Text>
          <Text style={styles.secondary}>{payment.reference}</Text>
        </View>
        <PaymentMethodBadge method={payment.method} />
      </View>

      <View style={styles.divider} />

      {/* Monto, fecha y servicio */}
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text style={styles.strong}>{formatCOP(payment.amount)}</Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.strong}>{formatDateTime(payment.date, payment.time)}</Text>
          <Text style={styles.secondary}>{payment.serviceName}</Text>
        </View>
      </View>

      {/* Botón de acción */}
      <Pressable
        onPress={() => onOpen(payment)}
        style={({ pressed }) => [
          styles.actionButton,
          isPending && styles.actionPrimary,
          isRejected && styles.actionDanger,
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.actionText,
            isPending && styles.actionTextPrimary,
            isRejected && styles.actionTextDanger,
          ]}
        >
          {ACTION_LABEL[payment.status]}
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    pressed: { opacity: 0.85 },
    card: {
      padding: 16,
      gap: 4,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    rightColumn: { flex: 1.4, alignItems: 'flex-end' },
    customer: { fontSize: 16, fontWeight: '700', color: colors.text },
    strong: { fontSize: 15, fontWeight: '700', color: colors.text },
    secondary: { fontSize: 13, color: colors.textSecondary },
    divider: { height: 1, marginVertical: 10, backgroundColor: colors.border },
    actionButton: {
      height: 42,
      marginTop: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    actionPrimary: { borderColor: colors.primary, backgroundColor: colors.primary },
    actionDanger: { borderColor: colors.error, backgroundColor: colors.card },
    actionText: { fontSize: 14, fontWeight: '700', color: colors.text },
    actionTextPrimary: { color: colors.onPrimary },
    actionTextDanger: { color: colors.error },
  });
