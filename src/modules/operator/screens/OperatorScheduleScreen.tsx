import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { ChipTabs } from '../../../shared/components/screen/ChipTabs';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { StatGrid, StatTile } from '../../../shared/components/screen/StatTile';
import { OperatorLayout } from '../../../shared/layouts/OperatorLayout';
import { withAlpha } from '../../../shared/utils/color';
import { toISODate, todayISO } from '../../../shared/utils/format';
import { MiniCalendar } from '../components/MiniCalendar';
import { ReservationCard } from '../components/ReservationCard';
import { ReservationDetailModal } from '../components/ReservationDetailModal';
import { OperatorReservation } from '../models/operator';
import { useOperatorReservations } from '../viewmodels/useOperatorReservations';

type Tab = 'day' | 'week' | 'completed';

// lunes y domingo de la semana de una fecha
function weekRange(iso: string): { start: string; end: string } {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toISODate(monday), end: toISODate(sunday) };
}

// Mi Agenda: calendario, servicios del día / semana / realizados y el próximo servicio
export function OperatorScheduleScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const vm = useOperatorReservations();
  const [tab, setTab] = useState<Tab>('day');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [detail, setDetail] = useState<OperatorReservation | null>(null);

  const servicesByDate = useMemo(() => {
    const map: Record<string, number> = {};
    vm.reservations.forEach((r) => {
      map[r.date] = (map[r.date] ?? 0) + 1;
    });
    return map;
  }, [vm.reservations]);

  const dayList = vm.reservations.filter((r) => r.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

  const visible = useMemo(() => {
    if (tab === 'week') {
      const { start, end } = weekRange(selectedDate);
      return vm.reservations
        .filter((r) => r.date >= start && r.date <= end)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    }
    if (tab === 'completed') {
      return vm.reservations
        .filter((r) => r.status === 'finalizado')
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    }
    return dayList;
  }, [tab, selectedDate, vm.reservations, dayList]);

  // próximo servicio de hoy que todavía no terminó
  const now = new Date();
  const next =
    selectedDate === todayISO()
      ? dayList.find((r) => r.status !== 'finalizado' && new Date(`${r.date}T${r.time}`).getTime() >= now.getTime()) ?? null
      : null;
  const minutesToNext = next ? Math.max(0, Math.round((new Date(`${next.date}T${next.time}`).getTime() - now.getTime()) / 60000)) : 0;

  const months = t('CALENDAR.MONTHS', { returnObjects: true }) as string[];
  const [, month, day] = selectedDate.split('-').map(Number);
  const readableDate = `${day} ${t('SCHEDULE.OF')} ${Array.isArray(months) ? months[month - 1] : ''}`;

  const listTitle =
    tab === 'day' ? `${t('SCHEDULE.RESERVATIONS_OF')} ${readableDate}` : t(tab === 'week' ? 'SCHEDULE.TABS.WEEK' : 'SCHEDULE.TABS.DONE');

  return (
    <OperatorLayout activeKey="schedule">
      <ScreenScroll>
        <PageHeader title={t('SCHEDULE.TITLE')} subtitle={t('SCHEDULE.SUBTITLE')} icon="calendar-month" />

        <StatGrid>
          <StatTile value={dayList.length} label={t('SCHEDULE.STATS.TOTAL')} tone="primary" />
          <StatTile value={dayList.filter((r) => r.status === 'pendiente').length} label={t('SCHEDULE.STATS.PENDING')} tone="warning" />
          <StatTile value={dayList.filter((r) => r.status === 'en_progreso').length} label={t('SCHEDULE.STATS.IN_PROGRESS')} tone="primary" />
          <StatTile value={dayList.filter((r) => r.status === 'finalizado').length} label={t('SCHEDULE.STATS.DONE')} tone="success" />
        </StatGrid>

        <MiniCalendar selectedDate={selectedDate} servicesByDate={servicesByDate} onSelect={setSelectedDate} />

        <ChipTabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'day', label: t('SCHEDULE.TABS.DAY') },
            { value: 'week', label: t('SCHEDULE.TABS.WEEK') },
            { value: 'completed', label: t('SCHEDULE.TABS.DONE') },
          ]}
        />

        {tab === 'day' && next ? (
          <View style={[styles.next, { backgroundColor: withAlpha(colors.primary, 0.1), borderColor: withAlpha(colors.primary, 0.35) }]}>
            <MaterialIcons name="schedule" size={26} color={colors.primary} />
            <View style={styles.flex}>
              <Text style={[styles.nextLabel, { color: colors.primary }]}>
                {t('SCHEDULE.NEXT.LABEL')} · {t('SCHEDULE.NEXT.IN_MINUTES', { min: minutesToNext })}
              </Text>
              <Text style={[styles.nextTitle, { color: colors.text }]}>
                {next.service} — {next.client}
              </Text>
            </View>
            {next.status === 'pendiente' ? (
              <ActionButton small label={t('SCHEDULE.START')} onPress={() => vm.start(next)} />
            ) : (
              <ActionButton small label={t('SCHEDULE.FINISH')} onPress={() => vm.finish(next)} />
            )}
          </View>
        ) : null}

        <Text style={[styles.listTitle, { color: colors.text }]}>{listTitle}</Text>
        {visible.length === 0 ? (
          <EmptyState icon="event-busy" title={t('SCHEDULE.EMPTY')} />
        ) : (
          visible.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              showDate={tab !== 'day'}
              onStart={vm.start}
              onFinish={vm.finish}
              onDetail={setDetail}
            />
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
  flex: { flex: 1 },
  next: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  nextLabel: { fontSize: fontSize.caption, fontWeight: fontWeight.bold },
  nextTitle: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
  listTitle: { fontSize: fontSize.cardTitle, fontWeight: fontWeight.bold },
});
