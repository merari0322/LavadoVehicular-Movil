import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { PendingPayment } from '../types/dashboard.types';
import { formatCOP } from '../viewmodels/useAdminDashboardViewModel';

const BANK_COLORS: Record<'bancolombia' | 'nequi', { bg: string; text: string }> = {
  bancolombia: { bg: '#E6EFFF', text: '#2B5FD9' },
  nequi: { bg: '#F3E6FF', text: '#8A2BE2' },
};

interface PendingPaymentsCardProps {
  payments: PendingPayment[];
  total: number;
}

export function PendingPaymentsCard({ payments, total }: PendingPaymentsCardProps) {
  const { colors } = useTheme();

  const bankStyle = (bankClass: PendingPayment['bankClass']) =>
    bankClass === 'daviplata' ? { bg: colors.errorSoft, text: colors.error } : BANK_COLORS[bankClass];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <MaterialIcons name="payments" size={18} color={colors.warning} />
            <Text style={[styles.title, { color: colors.text }]}>Pagos pendientes de revisión</Text>
          </View>
          <Text style={[styles.muted, { color: colors.textSecondary }]}>Comprobantes enviados para validación</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.warningSoft }]}>
          <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '600' }}>{total} pend.</Text>
        </View>
      </View>

      {payments.map((p) => {
        const bank = bankStyle(p.bankClass);
        return (
          <View key={p.reference} style={[styles.row, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={[styles.client, { color: colors.text }]}>{p.client}</Text>
                <View style={[styles.tag, { backgroundColor: bank.bg }]}>
                  <Text style={[styles.tagText, { color: bank.text }]}>{p.bank}</Text>
                </View>
              </View>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>{p.service}</Text>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                Ref: {p.reference} <Text style={{ color: colors.primary, fontWeight: '700' }}>{formatCOP(p.amount)} COP</Text>
              </Text>
            </View>
            <TouchableOpacity style={[styles.reviewBtn, { backgroundColor: colors.primary }]}>
              <MaterialIcons name="visibility" size={14} color={colors.onPrimary} />
              <Text style={[styles.reviewText, { color: colors.onPrimary }]}>Revisar</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '700' },
  muted: { fontSize: 11, marginTop: 2 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  client: { fontSize: 13, fontWeight: '600' },
  tag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 10, fontWeight: '600' },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  reviewText: { fontSize: 11, fontWeight: '600' },
});
