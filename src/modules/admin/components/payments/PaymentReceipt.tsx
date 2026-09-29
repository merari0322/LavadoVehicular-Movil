import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { PAYMENT_TEXTS } from '../../constants/paymentTexts';
import { Payment } from '../../models/payment';
import { BUSINESS } from '../../services/paymentMock';
import { formatCurrencyExact, formatDateTime } from '../../utils/paymentUtils';

interface ReceiptRowProps {
  label: string;
  value: string;
}

// Fila del comprobante: etiqueta a la izquierda, valor a la derecha
function ReceiptRow({ label, value }: ReceiptRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// Simula el comprobante digital que envía el cliente (con código de barras decorativo)
export function PaymentReceipt({ payment }: { payment: Payment }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const texts = PAYMENT_TEXTS.review;

  const isCash = payment.method === 'cash';
  const isRejected = payment.status === 'rejected';
  const title = isCash ? texts.cashTitle : `${PAYMENT_TEXTS.methods[payment.method]} Colombia`;

  // El grosor de cada barra sale de la referencia, así cada pago tiene su propio código
  const bars = useMemo(() => {
    const seed = payment.reference || payment.code;
    return Array.from({ length: 48 }, (_, index) => 1 + ((seed.charCodeAt(index % seed.length) + index) % 3));
  }, [payment.reference, payment.code]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.iconWrapper}>
        <MaterialIcons
          name={isRejected ? 'cancel' : 'check-circle'}
          size={38}
          color={isRejected ? colors.error : colors.primaryHover}
        />
      </View>

      <Text style={styles.amount}>{formatCurrencyExact(payment.declaredAmount)}</Text>

      <View style={styles.rows}>
        <ReceiptRow label={texts.to} value={BUSINESS.name} />
        <ReceiptRow label={texts.taxId} value={BUSINESS.phone} />
        <ReceiptRow label={texts.reference} value={payment.reference} />
        <ReceiptRow label={texts.dateTime} value={`${formatDateTime(payment.date, payment.time)} COT`} />
      </View>

      <View style={styles.barcode}>
        {bars.map((width, index) => (
          <View key={index} style={[styles.bar, { width }]} />
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      padding: 18,
      gap: 10,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.08),
    },
    title: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: colors.textSecondary },
    iconWrapper: { alignItems: 'center' },
    amount: { textAlign: 'center', fontSize: 28, fontWeight: '800', color: colors.text },
    rows: { gap: 8, marginTop: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    rowLabel: { fontSize: 13, color: colors.textSecondary },
    rowValue: { flexShrink: 1, textAlign: 'right', fontSize: 13, fontWeight: '700', color: colors.text },
    barcode: {
      height: 30,
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    bar: { height: 30, backgroundColor: withAlpha(colors.textMuted, 0.55) },
  });
