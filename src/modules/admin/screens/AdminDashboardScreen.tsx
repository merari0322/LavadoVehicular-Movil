import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { RootStackParamList } from '../../../core/navigation/types';
import { apiErrorKey } from '../../../core/api/apiError';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { OperatorsStatusCard } from '../components/dashboard/OperatorsStatusCard';
import { PendingPaymentsCard } from '../components/dashboard/PendingPaymentsCard';
import { UnassignedBookingsCard } from '../components/dashboard/UnassignedBookingsCard';
import { PaymentReviewModal } from '../components/payments/PaymentReviewModal';
import { AssignOperatorModal } from '../components/reservations/AssignOperatorModal';
import { DASHBOARD_TEXTS } from '../constants/dashboardTexts';
import { TEXTS as RESERVATION_TEXTS } from '../constants/reservationTexts';
import { Payment } from '../models/payment';
import { Reservation } from '../models/reservation';
import { formatCOP, useAdminDashboardViewModel } from '../viewmodels/useAdminDashboardViewModel';
import { useServicesByOperator } from '../viewmodels/useServicesByOperator';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;

// inicio del administrador: mismos accesos y modales que el dashboard de la web
export function AdminDashboardScreen({ navigation }: Props) {
  const { colors } = useTheme();
  // vuelve a pintar la pantalla cuando cambia el idioma
  const { t } = useTranslation();
  const vm = useAdminDashboardViewModel();
  const texts = DASHBOARD_TEXTS;

  // modales: revisar pago y asignar operario
  const [reviewing, setReviewing] = useState<Payment | null>(null);
  // si payment-service rechaza la aprobación o el rechazo, se explica por qué (ya traducido)
  const reportPaymentError = (error: unknown) => {
    if (error) Alert.alert(t('COMMON.ERROR'), t(apiErrorKey(error)));
  };
  const [assigning, setAssigning] = useState<Reservation | null>(null);
  const servicesByOperator = useServicesByOperator(vm.reservations);

  const handleAssign = async (reservation: Reservation, operatorId: string) => {
    setAssigning(null);
    if (!(await vm.assignOperator(reservation.id, operatorId))) return;
    const name = vm.operatorsFull.find((item) => item.id === operatorId)?.name ?? '';
    setTimeout(
      () => Alert.alert(RESERVATION_TEXTS.assign.successTitle, RESERVATION_TEXTS.assign.successMessage(name, reservation.code)),
      300,
    );
  };

  return (
    <AdminLayout activeKey="dashboard">
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialIcons name="storefront" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, { color: colors.text }]}>{texts.hello(vm.adminName)}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {vm.today} · <Text style={{ color: colors.primary }}>{texts.panel}</Text>
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AdminReservations')}
          >
            <MaterialIcons name="calendar-today" size={16} color={colors.onPrimary} />
            <Text style={[styles.headerBtnText, { color: colors.onPrimary }]}>{texts.todayBookings}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="event"
            badgeText={texts.stats.vsYesterday(vm.stats.vsYesterday)}
            value={vm.stats.bookingsToday}
            label={texts.stats.bookingsToday}
          />
          <StatCard
            icon="autorenew"
            badgeText={texts.stats.activeBays(vm.stats.activeBays)}
            value={vm.stats.servicesInProgress}
            label={texts.stats.inProgress}
          />
          <StatCard
            icon="fact-check"
            iconTone="warning"
            badgeTone="warning"
            badgeText={texts.stats.toReview}
            value={vm.stats.pendingPayments}
            label={texts.stats.pendingPayments}
          />
          <StatCard icon="payments" badgeText="COP" value={formatCOP(vm.stats.revenueToday)} label={texts.stats.revenueToday} />
        </View>

        <RevenueChart
          data={vm.weeklyRevenue}
          weekTotal={vm.weekTotal}
          busiestDay={vm.busiestDay}
          barHeightPct={vm.barHeightPct}
          onViewReport={() => navigation.navigate('AdminReports')}
        />
        <OperatorsStatusCard
          operators={vm.operators}
          countByStatus={vm.countByStatus}
          statusLabel={vm.statusLabel}
          onManageShifts={() => navigation.navigate('AdminOperators')}
        />
        <PendingPaymentsCard
          payments={vm.pendingPayments}
          onReview={setReviewing}
          onViewAll={() => navigation.navigate('AdminPayments')}
        />
        <UnassignedBookingsCard
          bookings={vm.unassignedBookings}
          onAssign={setAssigning}
          onViewAll={() => navigation.navigate('AdminReservations')}
        />
      </ScrollView>

      <PaymentReviewModal
        payment={reviewing}
        onClose={() => setReviewing(null)}
        onApprove={async (id) => {
          setReviewing(null);
          reportPaymentError(await vm.approvePayment(id));
        }}
        onReject={async (id, reason) => {
          setReviewing(null);
          reportPaymentError(await vm.rejectPayment(id, reason));
        }}
      />
      <AssignOperatorModal
        reservation={assigning}
        operators={vm.operatorsFull}
        servicesByOperator={servicesByOperator}
        onClose={() => setAssigning(null)}
        onAssign={handleAssign}
      />
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  // el espacio de abajo evita que la barra inferior flotante tape el contenido
  content: { padding: 16, marginTop: 30, paddingBottom: 130 },
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 },
  headerIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  headerBtnText: { fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
