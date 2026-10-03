import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { RootStackParamList } from '../../../core/navigation/types';
import { useSession } from '../../../core/services/auth';
import { isActiveStatus, isFinishedStatus } from '../../../core/services/booking/bookingDisplay';
import { Pill } from '../../../shared/components/ui/Pill';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ProgressBar } from '../../../shared/components/screen/ProgressBar';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { StatGrid, StatTile } from '../../../shared/components/screen/StatTile';
import { BUSINESS_LOCATION } from '../../../shared/constants/business';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { withAlpha } from '../../../shared/utils/color';
import { PROGRESS_BY_STATUS } from '../models/client';
import { BENEFITS, LOYALTY } from '../services/clientMock';
import { useClientBookings } from '../viewmodels/useClientBookings';
import { useClientVehicles } from '../viewmodels/useClientVehicles';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientHome'>;
type IconName = keyof typeof MaterialIcons.glyphMap;

// accesos rápidos del dashboard (mismos de la web)
const QUICK_ACCESS: { icon: IconName; label: string; route: keyof RootStackParamList }[] = [
  { icon: 'calendar-today', label: 'DASHBOARD.QUICK_ACCESS.BOOK_WASH', route: 'ClientReserve' },
  { icon: 'credit-card', label: 'DASHBOARD.QUICK_ACCESS.PAY_SERVICE', route: 'ClientPayment' },
  { icon: 'directions-car', label: 'DASHBOARD.QUICK_ACCESS.MY_VEHICLES', route: 'ClientVehicles' },
  { icon: 'notifications', label: 'DASHBOARD.QUICK_ACCESS.NOTIFICATIONS', route: 'ClientNotifications' },
];

// isoDate() de hoy, para comparar contra booking.date (aaaa-mm-dd)
function todayISO(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// dashboard del cliente: resumen, próximo servicio, accesos rápidos y beneficios
export function ClientHomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useSession();
  const { vehicles, loading } = useClientVehicles();
  const { bookings } = useClientBookings();
  const feedback = useFeedback();

  const activeReservations = bookings.filter((booking) => isActiveStatus(booking.status));
  const washesDone = bookings.filter((booking) => isFinishedStatus(booking.status)).length;

  // la próxima: la reserva activa con fecha y hora más cercanas desde hoy
  const today = todayISO();
  const upcoming = activeReservations
    .filter((booking) => booking.date >= today)
    .sort((a, b) => `${a.date} ${a.timeRange}`.localeCompare(`${b.date} ${b.timeRange}`));
  const service = upcoming[0] ?? null;
  const progress = service ? PROGRESS_BY_STATUS[service.status] ?? 0 : 0;
  const loyaltyPercentage = Math.round((LOYALTY.current / LOYALTY.goal) * 100);

  const viewNextServiceDetail = () => {
    if (!service) return;
    feedback.showStatus({
      type: 'info',
      icon: 'event',
      title: t('DASHBOARD.NEXT_SERVICE.TITLE'),
      message: t('DASHBOARD.NEXT_SERVICE.DETAIL_MESSAGE'),
      buttonText: t('COMMON.CLOSE'),
      details: [
        { label: t('RESERVE.SUMMARY.SERVICE'), value: service.services.join(', ') },
        { label: t('RESERVE.SUMMARY.VEHICLE'), value: `${service.vehicle} · ${service.plate}`.trim() },
        { label: t('RESERVE.SUMMARY.DATE'), value: `${service.displayDate} · ${service.timeRange}` },
        { label: t('RESERVE.SUMMARY.LOCATION'), value: BUSINESS_LOCATION.address },
        // el booking-service todavía no asigna operario a la reserva
        { label: t('DASHBOARD.NEXT_SERVICE.OPERATOR_ASSIGNED'), value: '—' },
        { label: t('DASHBOARD.NEXT_SERVICE.STATUS'), value: t(`STATUS.${service.status}`) },
        { label: t('DASHBOARD.NEXT_SERVICE.PROGRESS'), value: `${progress}%` },
      ],
    });
  };

  return (
    <ClientLayout activeKey="dashboard">
      <ScreenScroll>
        <PageHeader
          title={t('DASHBOARD.HELLO', { name: user?.firstName ?? '' })}
          subtitle={t('DASHBOARD.SUBTITLE')}
        />

        <StatGrid>
          <StatTile
            icon="calendar-today"
            value={activeReservations.length}
            label={t('DASHBOARD.STATS.ACTIVE_RESERVATIONS')}
            onPress={() => navigation.navigate('ClientHistory')}
          />
          <StatTile
            icon="directions-car"
            value={loading ? '…' : vehicles.length}
            label={t('DASHBOARD.STATS.MY_VEHICLES')}
            onPress={() => navigation.navigate('ClientVehicles')}
          />
          <StatTile icon="water-drop" value={washesDone} label={t('DASHBOARD.STATS.WASHES_DONE')} />
          <StatTile
            icon="notifications"
            value={t('COMMON.VIEW')}
            label={t('SIDEBAR.NOTIFICATIONS')}
            onPress={() => navigation.navigate('ClientNotifications')}
          />
        </StatGrid>

        {/* Próximo servicio: la reserva activa más próxima (booking-service) */}
        {service ? (
          <SectionCard
            title={t('DASHBOARD.NEXT_SERVICE.TITLE')}
            icon="schedule"
            right={<Pill label={t(`STATUS.${service.status}`)} tone="primary" />}
          >
            <Text style={[styles.strong, { color: colors.text }]}>
              {service.services.join(', ')} — {service.vehicle} · {service.plate}
            </Text>
            <Text style={[styles.muted, { color: colors.textSecondary }]}>
              {service.displayDate} · {service.timeRange}
            </Text>
            <View style={styles.meta}>
              <MaterialIcons name="storefront" size={16} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {BUSINESS_LOCATION.name} · {BUSINESS_LOCATION.address}
              </Text>
            </View>
            <View style={styles.meta}>
              <MaterialIcons name="person" size={16} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {/* el booking-service todavía no asigna operario a la reserva */}
                {t('DASHBOARD.NEXT_SERVICE.OPERATOR_ASSIGNED')}: —
              </Text>
            </View>
            <ProgressBar percentage={progress} label={t('DASHBOARD.NEXT_SERVICE.PROGRESS')} />
            <ActionButton label={t('DASHBOARD.NEXT_SERVICE.VIEW_DETAIL')} variant="outline" onPress={viewNextServiceDetail} />
          </SectionCard>
        ) : null}

        {/* Accesos rápidos */}
        <SectionCard title={t('DASHBOARD.QUICK_ACCESS.TITLE')}>
          <View style={styles.quickGrid}>
            {QUICK_ACCESS.map((item) => (
              <Pressable
                key={item.route}
                onPress={() => (navigation.navigate as (name: keyof RootStackParamList) => void)(item.route)}
                style={({ pressed }) => [
                  styles.quickItem,
                  { backgroundColor: withAlpha(colors.primary, 0.08), borderColor: withAlpha(colors.primary, 0.2) },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <MaterialIcons name={item.icon} size={24} color={colors.primary} />
                <Text style={[styles.quickLabel, { color: colors.text }]}>{t(item.label)}</Text>
              </Pressable>
            ))}
          </View>
        </SectionCard>

        {/* Beneficios y promociones */}
        <SectionCard title={t('DASHBOARD.BENEFITS.TITLE')} icon="card-giftcard">
          {BENEFITS.map((benefit) => (
            <View key={benefit.title} style={[styles.benefit, { backgroundColor: withAlpha(colors.primary, 0.08) }]}>
              <Text style={[styles.strong, { color: colors.text }]}>{benefit.title}</Text>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>{benefit.description}</Text>
            </View>
          ))}
          <ProgressBar
            percentage={loyaltyPercentage}
            label={`${t('DASHBOARD.BENEFITS.LOYALTY_PROGRESS')} (${LOYALTY.current}/${LOYALTY.goal})`}
          />
        </SectionCard>
      </ScreenScroll>
      {feedback.modals}
    </ClientLayout>
  );
}

const styles = StyleSheet.create({
  strong: { fontSize: fontSize.body + 1, fontWeight: fontWeight.semibold },
  muted: { fontSize: fontSize.small },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { flex: 1, fontSize: fontSize.small },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  quickItem: {
    flexBasis: '48%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  quickLabel: { fontSize: fontSize.small, fontWeight: fontWeight.semibold, textAlign: 'center' },
  benefit: { gap: 2, padding: spacing.md, borderRadius: radius.md },
});
