import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, useTheme } from '../../../app/theme';
import { ChipTabs } from '../../../shared/components/screen/ChipTabs';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { DateInput, SearchInput } from '../../../shared/components/screen/FilterInputs';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { StatGrid, StatTile } from '../../../shared/components/screen/StatTile';
import { OperatorLayout } from '../../../shared/layouts/OperatorLayout';
import { displayToISO, todayISO } from '../../../shared/utils/format';
import { ReservationCard } from '../components/ReservationCard';
import { ReservationDetailModal } from '../components/ReservationDetailModal';
import { OperatorReservation } from '../models/operator';
import { useOperatorReservations } from '../viewmodels/useOperatorReservations';

// Servicios asignados: todos los servicios del operario con filtros y su detalle
export function OperatorAssignedScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const vm = useOperatorReservations();
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<OperatorReservation | null>(null);

  const today = todayISO();
  const all = vm.reservations;

  const visible = useMemo(() => {
    const iso = displayToISO(date);
    const text = search.trim().toLowerCase();
    return all
      .filter((r) => {
        if (iso && r.date !== iso) return false;
        if (type && r.service !== type) return false;
        if (text) {
          return [r.code, r.client, r.plate, r.vehicleName, r.service].some((value) =>
            value.toLowerCase().includes(text),
          );
        }
        return true;
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [all, date, type, search]);

  // nombres de servicio que aparecen en sus servicios (salen de los datos)
  const serviceTypes = useMemo(() => [...new Set(all.map((r) => r.service))], [all]);

  const hasFilters = date !== '' || type !== '' || search !== '';
  const clear = () => {
    setDate('');
    setType('');
    setSearch('');
  };

  return (
    <OperatorLayout activeKey="assigned">
      <ScreenScroll>
        <PageHeader title={t('ASSIGNED_SERVICES.TITLE')} subtitle={t('ASSIGNED_SERVICES.SUBTITLE')} />

        <StatGrid>
          <StatTile value={all.length} label={t('ASSIGNED_SERVICES.STATS.TOTAL')} />
          <StatTile value={all.filter((r) => r.status === 'pendiente').length} label={t('ASSIGNED_SERVICES.STATS.PENDING')} tone="warning" />
          <StatTile value={all.filter((r) => r.status === 'en_progreso').length} label={t('ASSIGNED_SERVICES.STATS.IN_PROGRESS')} />
          <StatTile
            value={all.filter((r) => r.status === 'finalizado' && r.date === today).length}
            label={t('ASSIGNED_SERVICES.STATS.COMPLETED_TODAY')}
            tone="success"
          />
        </StatGrid>

        <SectionCard
          title={t('ASSIGNED_SERVICES.FILTERS.TITLE')}
          icon="filter-list"
          right={
            hasFilters ? (
              <Pressable onPress={clear} hitSlop={8}>
                <MaterialIcons name="refresh" size={22} color={colors.primary} />
              </Pressable>
            ) : null
          }
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('ASSIGNED_SERVICES.FILTERS.BY_DATE')}</Text>
          <DateInput value={date} onChange={setDate} />
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('ASSIGNED_SERVICES.FILTERS.BY_TYPE')}</Text>
          <ChipTabs<string>
            value={type}
            onChange={setType}
            options={[
              { value: '', label: t('ASSIGNED_SERVICES.FILTERS.ALL') },
              ...serviceTypes.map((service) => ({ value: service, label: service })),
            ]}
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('ASSIGNED_SERVICES.FILTERS.BY_SERVICE')}</Text>
          <SearchInput value={search} onChange={setSearch} placeholder={t('ASSIGNED_SERVICES.FILTERS.SEARCH_PLACEHOLDER')} />
        </SectionCard>

        {visible.length === 0 ? (
          <EmptyState icon="search-off" title={t('HISTORY_TABLE.EMPTY')} />
        ) : (
          visible.map((r) => (
            <ReservationCard key={r.id} reservation={r} showDate onStart={vm.start} onFinish={vm.finish} onDetail={setDetail} />
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
  label: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
});
