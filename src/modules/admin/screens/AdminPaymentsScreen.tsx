import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { withAlpha } from '../../../shared/utils/color';
import { ManualPaymentModal } from '../components/payments/ManualPaymentModal';
import { PaymentCard } from '../components/payments/PaymentCard';
import { PaymentFilters } from '../components/payments/PaymentFilters';
import { PaymentReviewModal } from '../components/payments/PaymentReviewModal';
import { PaymentStats } from '../components/payments/PaymentStats';
import { PAYMENT_TEXTS } from '../constants/paymentTexts';
import { ManualPaymentValues, Payment } from '../models/payment';
import { isoToDisplay } from '../utils/reservationUtils';
import { usePayments } from '../viewmodels/usePayments';

// Escapa un valor para CSV (comillas dobles)
const csvValue = (value: string): string => `"${value.replace(/"/g, '""')}"`;

export const AdminPaymentsScreen = () => {
  // vuelve a pintar la pantalla cuando cambia el idioma
  useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    filteredPayments,
    filters,
    stats,
    updateFilters,
    clearFilters,
    approvePayment,
    rejectPayment,
    createManualPayment,
  } = usePayments();

  // Modal de pago manual
  const [manualVisible, setManualVisible] = useState(false);

  // Modal de revisión (revisar, recibo o motivo)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Guarda el pago manual y cierra el modal
  const handleManualSubmit = (values: ManualPaymentValues) => {
    createManualPayment(values);
    setManualVisible(false);
  };

  // Aprueba el pago y cierra el modal
  const handleApprove = (id: string) => {
    approvePayment(id);
    setSelectedPayment(null);
  };

  // Rechaza el pago con su motivo y cierra el modal
  const handleReject = (id: string, reason: string) => {
    rejectPayment(id, reason);
    setSelectedPayment(null);
  };

  // Exporta los pagos filtrados en CSV usando el menú de compartir
  const handleExport = async () => {
    const header = [...PAYMENT_TEXTS.csvHeaders];
    const rows = filteredPayments.map((item) =>
      [
        item.code,
        item.customerName,
        item.document,
        item.phone,
        item.reference,
        PAYMENT_TEXTS.methods[item.method],
        String(item.amount),
        String(item.declaredAmount),
        isoToDisplay(item.date),
        item.time,
        item.serviceName,
        PAYMENT_TEXTS.status[item.status],
      ]
        .map(csvValue)
        .join(','),
    );

    await Share.share({ message: [header.map(csvValue).join(','), ...rows].join('\n') });
  };

  return (
    <AdminLayout activeKey="payments">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Título */}
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <MaterialIcons name="account-balance-wallet" size={26} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.title}>{PAYMENT_TEXTS.title}</Text>
              <Text style={styles.subtitle}>{PAYMENT_TEXTS.subtitle}</Text>
            </View>
          </View>

          {/* Acciones principales */}
          <View style={styles.actions}>
            <Pressable style={[styles.actionButton, styles.exportButton]} onPress={handleExport}>
              <MaterialIcons name="file-download" size={20} color={colors.text} />
              <Text style={styles.exportText}>{PAYMENT_TEXTS.export}</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.newButton]}
              onPress={() => setManualVisible(true)}
            >
              <MaterialIcons name="add" size={20} color={colors.onPrimary} />
              <Text style={styles.newText}>{PAYMENT_TEXTS.newPayment}</Text>
            </Pressable>
          </View>

          {/* Estadísticas */}
          <PaymentStats stats={stats} />

          {/* Buscador y filtros */}
          <PaymentFilters filters={filters} onChange={updateFilters} onClear={clearFilters} />

          {/* Lista de pagos */}
          <Text style={styles.count}>{PAYMENT_TEXTS.list.count(filteredPayments.length)}</Text>

          {filteredPayments.length === 0 ? (
            <View style={styles.empty}>
              <MaterialIcons name="search" size={36} color={withAlpha(colors.textMuted, 0.8)} />
              <Text style={styles.emptyTitle}>{PAYMENT_TEXTS.list.empty}</Text>
              <Text style={styles.emptyHint}>{PAYMENT_TEXTS.list.emptyHint}</Text>
            </View>
          ) : (
            filteredPayments.map((item) => (
              <PaymentCard key={item.id} payment={item} onOpen={setSelectedPayment} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Modales */}
      <ManualPaymentModal
        visible={manualVisible}
        onClose={() => setManualVisible(false)}
        onSubmit={handleManualSubmit}
      />
      <PaymentReviewModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </AdminLayout>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1 },
    // El espacio de abajo evita que la barra inferior flotante tape el contenido
    content: { gap: 16, padding: 16, paddingBottom: 130 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    titleIcon: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    title: { fontSize: 20, fontWeight: '800', color: colors.text },
    subtitle: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    actions: { gap: 10 },
    actionButton: {
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
    },
    exportButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    exportText: { fontSize: 14, fontWeight: '700', color: colors.text },
    newButton: { backgroundColor: colors.primary },
    newText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
    count: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    empty: { alignItems: 'center', gap: 6, paddingVertical: 32 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    emptyHint: { fontSize: 13, color: colors.textSecondary },
  });
