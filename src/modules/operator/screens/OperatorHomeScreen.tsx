import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, spacing, useTheme } from '../../../app/theme';
import { RootStackParamList } from '../../../core/navigation/types';
import { useSession } from '../../../core/services/auth';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ProgressBar } from '../../../shared/components/screen/ProgressBar';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { StatGrid, StatTile } from '../../../shared/components/screen/StatTile';
import { OperatorLayout } from '../../../shared/layouts/OperatorLayout';
import { todayISO } from '../../../shared/utils/format';
import { ReservationCard } from '../components/ReservationCard';
import { ReservationDetailModal } from '../components/ReservationDetailModal';
import { OperatorReservation } from '../models/operator';
// no leídas reales (notification-service) y promedio de calificaciones (operations-service)
import { notificationService } from '../../../core/services/notifications/NotificationService';
import { operationsService } from '../../../core/services/operations/OperationsService';
import { useOperatorReservations } from '../viewmodels/useOperatorReservations';

type Props = NativeStackScreenProps<RootStackParamList, 'OperatorHome'>;

// inicio del operario: resumen del día y los servicios de hoy
export function OperatorHomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useSession();
  const vm = useOperatorReservations();
  // no leídas reales; 0 si notification-service no responde
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    notificationService.unreadCount().then(setUnread).catch(() => setUnread(0));
  }, []);
  // promedio de sus calificaciones; '—' si aún no tiene o el servicio no responde
  const [average, setAverage] = useState<number | string>('—');
  useEffect(() => {
    operationsService
      .myRatings()
      .then((list) => {
        if (list.length === 0) return;
        setAverage(Math.round((list.reduce((sum, r) => sum + r.rating, 0) / list.length) * 10) / 10);
      })
      .catch(() => undefined);
  }, []);
  const [detail, setDetail] = useState<OperatorReservation | null>(null);

  const today = todayISO();
  const todayList = vm.reservations.filter((r) => r.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const total = todayList.length;
  const inProgress = todayList.filter((r) => r.status === 'en_progreso').length;
  const pending = todayList.filter((r) => r.status === 'pendiente').length;
  const completed = todayList.filter((r) => r.status === 'finalizado').length;

  return (
    <OperatorLayout activeKey="dashboard">
      <ScreenScroll>
        <PageHeader
          title={t('OPERATOR_HOME.TITLE', { name: user?.firstName ?? '' })}
          subtitle={t('OPERATOR_HOME.SUBTITLE', { count: pending })}
          actionLabel={t('OPERATOR_HOME.BTN_SERVICES')}
          actionIcon="visibility"
          onAction={() => navigation.navigate('OperatorAssigned')}
        />

        <StatGrid>
          <StatTile icon="calendar-today" value={total} label={t('OPERATOR_HOME.STATS.ASSIGNED')} onPress={() => navigation.navigate('OperatorSchedule')} />
          <StatTile icon="sync" value={inProgress} label={t('OPERATOR_HOME.STATS.IN_PROGRESS')} onPress={() => navigation.navigate('OperatorSchedule')} />
          <StatTile
            icon="notifications"
            value={unread}
            badge={unread}
            label={t('OPERATOR_HOME.STATS.NOTIFICATIONS')}
            onPress={() => navigation.navigate('OperatorNotifications')}
          />
          <StatTile
            icon="star-outline"
            value={average}
            label={t('OPERATOR_HOME.STATS.RATING')}
            onPress={() => navigation.navigate('OperatorRatings')}
          />
        </StatGrid>

        <SectionCard title={t('OPERATOR_HOME.PROGRESS_LABEL')} icon="check-circle-outline">
          <Text style={[styles.numbers, { color: colors.text }]}>
            {completed} / {total}
          </Text>
          <ProgressBar percentage={total === 0 ? 0 : (completed / total) * 100} />
          <View style={styles.counters}>
            <View style={styles.counter}>
              <Text style={[styles.counterValue, { color: colors.primary }]}>{inProgress}</Text>
              <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>{t('OPERATOR_HOME.IN_PROGRESS')}</Text>
            </View>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <View style={styles.counter}>
              <Text style={[styles.counterValue, { color: colors.warning }]}>{pending}</Text>
              <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>{t('OPERATOR_HOME.PENDING')}</Text>
            </View>
          </View>
        </SectionCard>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('OPERATOR_HOME.RESERVATIONS_TITLE')}</Text>
        {todayList.length === 0 ? (
          <EmptyState icon="event-available" title={t('OPERATOR_HOME.EMPTY')} />
        ) : (
          todayList.map((r) => (
            <ReservationCard key={r.id} reservation={r} onStart={vm.start} onFinish={vm.finish} onDetail={setDetail} />
          ))
        )}
      </ScreenScroll>

      <ReservationDetailModal
        reservation={detail}
        onClose={() => setDetail(null)}
        onStart={vm.start}
        onFinish={vm.finish}
        onReport={vm.reportProgress}
        onContact={vm.contactClient}
      />
      {vm.modals}
    </OperatorLayout>
  );
}

const styles = StyleSheet.create({
  numbers: { fontSize: fontSize.statValue, fontWeight: fontWeight.bold },
  counters: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  counter: { flex: 1, alignItems: 'center', gap: 2 },
  counterValue: { fontSize: fontSize.pageTitle, fontWeight: fontWeight.extrabold },
  counterLabel: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
  separator: { width: 1, height: 36 },
  sectionTitle: { fontSize: fontSize.cardTitle, fontWeight: fontWeight.bold },
});
