import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { DASHBOARD_TEXTS } from '../../constants/dashboardTexts';
import { PAYMENT_TEXTS } from '../../constants/paymentTexts';
import { Payment, PaymentMethod } from '../../models/payment';
import { formatCOP } from '../../viewmodels/useAdminDashboardViewModel';
import { CardLink } from './CardLink';

// cuántos pagos se muestran en el inicio (el resto está en la pantalla de pagos)
const VISIBLE = 3;

const BANK_COLORS: Partial<Record<PaymentMethod, { bg: string; text: string }>> = {
  bancolombia: { bg: '#E6EFFF', text: '#2B5FD9' },
  nequi: { bg: '#F3E6FF', text: '#8A2BE2' },
};

interface PendingPaymentsCardProps {
  payments: Payment[];
  onReview: (payment: Payment) => void;
  onViewAll: () => void;
}

export function PendingPaymentsCard({ payments, onReview, onViewAll }: PendingPaymentsCardProps) {
  const { colors } = useTheme();
  const texts = DASHBOARD_TEXTS.payments;

  const bankStyle = (method: PaymentMethod) =>
    BANK_COLORS[method] ?? (method === 'daviplata' ? { bg: colors.errorSoft, text: colors.error } : { bg: colors.successSoft, text: colors.success });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <MaterialIcons name="payments" size={18} color={colors.warning} />
            <Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text>
          </View>
          <Text style={[styles.muted, { color: colors.textSecondary }]}>{texts.subtitle}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.warningSoft }]}>
          <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '600' }}>{texts.badge(payments.length)}</Text>
        </View>
      </View>

      {payments.length === 0 ? <Text style={[styles.empty, { color: colors.textSecondary }]}>{texts.empty}</Text> : null}

      {payments.slice(0, VISIBLE).map((p) => {
        const bank = bankStyle(p.method);
        return (
          <View key={p.id} style={[styles.row, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={[styles.client, { color: colors.text }]}>{p.customerName}</Text>
                <View style={[styles.tag, { backgroundColor: bank.bg }]}>
                  <Text style={[styles.tagText, { color: bank.text }]}>{PAYMENT_TEXTS.methods[p.method]}</Text>
                </View>
              </View>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>{p.serviceName}</Text>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                {texts.reference}: {p.reference}{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>{formatCOP(p.amount)} COP</Text>
              </Text>
            </View>
            <TouchableOpacity style={[styles.reviewBtn, { backgroundColor: colors.primary }]} onPress={() => onReview(p)}>
              <MaterialIcons name="visibility" size={14} color={colors.onPrimary} />
              <Text style={[styles.reviewText, { color: colors.onPrimary }]}>{texts.review}</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <CardLink label={texts.viewAll(payments.length)} onPress={onViewAll} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  muted: { fontSize: 11, marginTop: 2 },
  empty: { fontSize: 12, textAlign: 'center', paddingVertical: 12 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  client: { fontSize: 13, fontWeight: '600' },
  tag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 10, fontWeight: '600' },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  reviewText: { fontSize: 11, fontWeight: '600' },
});
