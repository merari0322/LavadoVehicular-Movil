import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, spacing, useTheme } from '../../../app/theme';
import { Pill } from '../../../shared/components/ui/Pill';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { ChipTabs } from '../../../shared/components/screen/ChipTabs';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { DateInput, SearchInput } from '../../../shared/components/screen/FilterInputs';
import { InfoRow } from '../../../shared/components/screen/InfoRow';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ProgressBar } from '../../../shared/components/screen/ProgressBar';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { StatGrid, StatTile } from '../../../shared/components/screen/StatTile';
import { vehicleIcon } from '../../../shared/constants/business';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { OperatorLayout } from '../../../shared/layouts/OperatorLayout';
import { displayToISO, formatCOP, isoToDisplay } from '../../../shared/utils/format';
import { HistoryStatus, ServiceHistoryItem, historyTone } from '../models/operator';
// servicios ya terminados, de booking-service (los cancelados no le llegan al operario)
import { useOperatorReservations } from '../viewmodels/useOperatorReservations';

type Tab = 'todos' | HistoryStatus;

// historial de servicios del operario: estadísticas, filtros y detalle de cada servicio
export function OperatorHistoryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const feedback = useFeedback();
  const vm = useOperatorReservations();
  const services: ServiceHistoryItem[] = useMemo(
    () =>
      vm.reservations
        .filter((r) => r.status === 'finalizado')
        .map((r) => ({
          id: r.id,
          code: r.code,
          date: r.date,
          time: r.time,
          service: r.service,
          vehicle: r.vehicleName,
          plate: r.plate,
          client: r.client,
          paymentMethod: r.paymentMethod,
          amount: r.total ?? 0,
          rating: r.rating ?? null,
          comment: r.comment ?? null,
          status: 'finalizado' as const,
          reason: null,
        })),
    [vm.reservations],
  );

  const [tab, setTab] = useState<Tab>('todos');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');

  const completed = services.filter((s) => s.status === 'finalizado');
  const totalGenerated = completed.reduce((sum, s) => sum + s.amount, 0);
  const rated = services.filter((s) => s.rating !== null);
  const averageRating = rated.length === 0 ? 0 : Math.round((rated.reduce((sum, s) => sum + (s.rating ?? 0), 0) / rated.length) * 10) / 10;
  const completionRate = services.length === 0 ? 0 : Math.round((completed.length / services.length) * 100);

  const countTab = (key: Tab) => (key === 'todos' ? services.length : services.filter((s) => s.status === key).length);

  const visible = useMemo(() => {
    const iso = displayToISO(date);
    const text = search.trim().toLowerCase();
    return services.filter((s) => {
      if (tab !== 'todos' && s.status !== tab) return false;
      if (iso && s.date !== iso) return false;
      if (type && s.service !== type) return false;
      if (text) {
        return [s.code, s.plate, s.client, s.vehicle, s.service].some((value) =>
          value.toLowerCase().includes(text),
        );
      }
      return true;
    });
  }, [services, tab, date, type, search]);

  // nombres de servicio del historial (salen de los datos)
  const serviceTypes = useMemo(() => [...new Set(services.map((s) => s.service))], [services]);

  const clear = () => {
    setSearch('');
    setDate('');
    setType('');
    setTab('todos');
  };

  const viewDetail = (s: ServiceHistoryItem) =>
    feedback.showStatus({
      type: 'info',
      icon: 'receipt-long',
      title: `${s.service} · ${s.code}`,
      message: s.client,
      buttonText: t('COMMON.CLOSE'),
      details: [
        { label: t('SERVICE_HISTORY.DETAIL.DATE'), value: `${isoToDisplay(s.date)} · ${s.time}` },
        { label: t('SERVICE_HISTORY.DETAIL.VEHICLE'), value: `${s.vehicle} · ${s.plate}` },
        { label: t('SERVICE_HISTORY.DETAIL.PAYMENT'), value: s.paymentMethod ? `${t(`SERVICE_HISTORY.METHODS.${s.paymentMethod}`)} · ${formatCOP(s.amount)}` : formatCOP(s.amount) },
        { label: t('HISTORY_TABLE.STATUS'), value: t(`SERVICE_HISTORY.STATUS.${s.status.toUpperCase()}`) },
        ...(s.rating !== null ? [{ label: t('SERVICE_HISTORY.DETAIL.RATING'), value: `★ ${s.rating}${s.comment ? ` · "${s.comment}"` : ''}` }] : []),
        ...(s.reason ? [{ label: t('SERVICE_HISTORY.DETAIL.REASON'), value: s.reason }] : []),
      ],
    });

  return (
    <OperatorLayout activeKey="history">
      <ScreenScroll>
        <PageHeader title={t('SERVICE_HISTORY.TITLE')} subtitle={t('SERVICE_HISTORY.SUBTITLE')} />

        <StatGrid>
          <StatTile icon="water-drop" value={completed.length} label={t('HISTORY_STATS.DONE')} />
          <StatTile icon="cancel" value={services.length - completed.length} label={t('HISTORY_STATS.CANCELED')} />
          <StatTile icon="payments" value={formatCOP(totalGenerated)} label={t('HISTORY_STATS.TOTAL')} />
          <StatTile icon="star" value={averageRating} label={t('HISTORY_STATS.RATING')} />
        </StatGrid>

        <SectionCard>
          <ProgressBar percentage={completionRate} label={t('SERVICE_HISTORY.COMPLETION_RATE')} />
        </SectionCard>

        <SectionCard>
          <SearchInput value={search} onChange={setSearch} placeholder={t('SERVICE_HISTORY.SEARCH_PLACEHOLDER')} />
          <View style={styles.row}>
            <DateInput value={date} onChange={setDate} />
            <ActionButton small variant="soft" icon="refresh" label={t('SERVICE_HISTORY.CLEAR')} onPress={clear} />
          </View>
          <ChipTabs<string>
            value={type}
            onChange={setType}
            options={[
              { value: '', label: t('SERVICE_HISTORY.ALL_SERVICES') },
              ...serviceTypes.map((service) => ({ value: service, label: service })),
            ]}
          />
          <ChipTabs<Tab>
            value={tab}
            onChange={setTab}
            options={[
              { value: 'todos', label: `${t('SERVICE_HISTORY.TABS.ALL')} (${countTab('todos')})` },
              { value: 'finalizado', label: `${t('SERVICE_HISTORY.TABS.DONE')} (${countTab('finalizado')})` },
              { value: 'cancelado', label: `${t('SERVICE_HISTORY.TABS.CANCELED')} (${countTab('cancelado')})` },
              { value: 'reasignado', label: `${t('SERVICE_HISTORY.TABS.REASSIGNED')} (${countTab('reasignado')})` },
            ]}
          />
        </SectionCard>

        {visible.length === 0 ? (
          <EmptyState icon="search-off" title={t('HISTORY_TABLE.EMPTY')} />
        ) : (
          visible.map((s) => (
            <SectionCard key={s.id}>
              <Pressable onPress={() => viewDetail(s)} style={styles.card}>
                <View style={styles.top}>
                  <Text style={[styles.code, { color: colors.primary }]}>{s.code}</Text>
                  <Pill label={t(`SERVICE_HISTORY.STATUS.${s.status.toUpperCase()}`)} tone={historyTone(s.status)} />
                </View>
                <View style={styles.titleRow}>
                  <MaterialIcons name={vehicleIcon('')} size={18} color={colors.primary} />
                  <Text style={[styles.title, { color: colors.text }]}>
                    {s.service} — {s.client}
                  </Text>
                </View>
                <InfoRow label={t('HISTORY_TABLE.DATE_COMPLETED')} value={`${isoToDisplay(s.date)} · ${s.time}`} />
                <InfoRow label={t('HISTORY_TABLE.VEHICLE')} value={`${s.vehicle} · ${s.plate}`} />
                <InfoRow label={t('HISTORY_TABLE.AMOUNT')} value={formatCOP(s.amount)} />
                {s.rating !== null ? <InfoRow label={t('HISTORY_TABLE.RATING')} value={`★ ${s.rating}`} /> : null}
                <Text style={[styles.more, { color: colors.primary }]}>{t('HISTORY_TABLE.DETAIL')} ›</Text>
              </Pressable>
            </SectionCard>
          ))
        )}
      </ScreenScroll>
      {feedback.modals}
    </OperatorLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  card: { gap: spacing.sm },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  code: { fontSize: fontSize.small, fontWeight: fontWeight.bold },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { flex: 1, fontSize: fontSize.body + 1, fontWeight: fontWeight.bold },
  more: { alignSelf: 'flex-end', fontSize: fontSize.small, fontWeight: fontWeight.bold },
});
