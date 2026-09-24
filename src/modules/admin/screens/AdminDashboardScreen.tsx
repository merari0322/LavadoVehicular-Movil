import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { StatCard } from '../components/StatCard';
import { RevenueChart } from '../components/RevenueChart';
import { OperatorsStatusCard } from '../components/OperatorsStatusCard';
import { PendingPaymentsCard } from '../components/PendingPaymentsCard';
import { UnassignedBookingsCard } from '../components/UnassignedBookingsCard';
import { formatCOP, useAdminDashboardViewModel } from '../viewmodels/useAdminDashboardViewModel';

export function AdminDashboardScreen() {
  const { colors } = useTheme();
  const vm = useAdminDashboardViewModel();

  return (
    <AdminLayout activeKey="dashboard">
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialIcons name="storefront" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, { color: colors.text }]}>¡Hola, {vm.adminName}!</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {vm.today} · <Text style={{ color: colors.primary }}>Panel de control general</Text>
              </Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="calendar_today" size={16} color={colors.onPrimary} />
            <Text style={[styles.headerBtnText, { color: colors.onPrimary }]}>Ver reservas de hoy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="event" badgeText={`↗ +${vm.stats.vsYesterday} vs ayer`} value={vm.stats.bookingsToday} label="Reservas de hoy" />
          <StatCard icon="autorenew" badgeText={`${vm.stats.activeBays} bahías activas`} value={vm.stats.servicesInProgress} label="En progreso" />
          <StatCard icon="fact_check" iconTone="warning" badgeTone="warning" badgeText="Por revisar" value={vm.stats.pendingPayments} label="Pagos por verificar" />
          <StatCard icon="payments" badgeText="COP" value={formatCOP(vm.stats.revenueToday)} label="Ingresos del día" />
        </View>

        <RevenueChart data={vm.weeklyRevenue} weekTotal={vm.weekTotal} barHeightPct={vm.barHeightPct} />
        <OperatorsStatusCard operators={vm.operators} countByStatus={vm.countByStatus} statusLabel={vm.statusLabel} />
        <PendingPaymentsCard payments={vm.pendingPayments} total={vm.stats.pendingPayments} />
        <UnassignedBookingsCard bookings={vm.unassignedBookings} />
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, marginTop: 30 },
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 },
  headerIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  headerBtnText: { fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
