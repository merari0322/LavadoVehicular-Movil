import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, spacing, useTheme } from '../../../app/theme';
import { RootStackParamList } from '../../../core/navigation/types';
import { isActiveStatus } from '../../../core/services/booking/bookingDisplay';
import { Pill } from '../../../shared/components/ui/Pill';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { ChipTabs } from '../../../shared/components/screen/ChipTabs';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { DateInput, SearchInput } from '../../../shared/components/screen/FilterInputs';
import { InfoRow } from '../../../shared/components/screen/InfoRow';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { displayToISO, formatCOP } from '../../../shared/utils/format';
import { RatingModal, RatingResult } from '../components/RatingModal';
import { ClientBookingItem } from '../models/booking-view';
import { useClientBookings } from '../viewmodels/useClientBookings';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientHistory'>;
type HistoryFilter = 'all' | 'active' | 'completed' | 'cancelled';

// historial de reservas reales del cliente (booking-service), con filtros, pagar e ir a calificar
export function ClientHistoryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const feedback = useFeedback();
  const vm = useClientBookings();

  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState<ClientBookingItem | null>(null);

  const visible = useMemo(() => {
    const from = displayToISO(dateFrom);
    const to = displayToISO(dateTo);
    const text = search.trim().toLowerCase();

    return vm.bookings.filter((booking) => {
      if (filter === 'active' && !isActiveStatus(booking.status)) return false;
      if (filter === 'completed' && booking.status !== 'COMPLETED') return false;
      if (filter === 'cancelled' && booking.status !== 'CANCELLED' && booking.status !== 'NO_SHOW') return false;

      // booking.date ya viene en aaaa-mm-dd, igual que los inputs de fecha
      if (from && booking.date < from) return false;
      if (to && booking.date > to) return false;

      if (text) {
        const haystack = [booking.code, booking.plate, booking.vehicle, ...booking.services, t(`STATUS.${booking.status}`)]
          .join(' ')
          .toLowerCase();
        return haystack.includes(text);
      }
      return true;
    });
  }, [vm.bookings, filter, dateFrom, dateTo, search, t]);

  const requestCancel = (booking: ClientBookingItem) =>
    feedback.askConfirm({
      title: t('HISTORY.CANCEL_CONFIRM.TITLE'),
      message: t('HISTORY.CANCEL_CONFIRM.MESSAGE', { code: booking.code }),
      confirmLabel: t('HISTORY.CANCEL_CONFIRM.CONFIRM'),
      cancelLabel: t('HISTORY.CANCEL_CONFIRM.BACK'),
      danger: true,
      onConfirm: async () => {
        const failure = await vm.cancel(booking.id);
        if (failure) {
          feedback.showError(failure);
          return;
        }
        feedback.showStatusAfterClose({
          title: t('HISTORY.CANCEL_SUCCESS.TITLE'),
          message: t('HISTORY.CANCEL_SUCCESS.MESSAGE', { code: booking.code }),
        });
      },
    });

  // el aviso de éxito sale solo si operations guardó la calificación
  const saveRating = async (result: RatingResult) => {
    if (!rating) return;
    const target = rating;
    setRating(null);
    const error = await vm.rate(target.id, result.rating, result.comment);
    if (error) {
      feedback.showError(error);
      return;
    }
    feedback.showStatusAfterClose({ title: t('RATINGS.SUCCESS_TITLE'), message: t('RATINGS.SUCCESS_MESSAGE') });
  };

  return (
    <ClientLayout activeKey="history">
      <ScreenScroll onRefresh={vm.reload} refreshing={vm.loading && vm.bookings.length > 0}>
        <PageHeader title={t('SIDEBAR.HISTORY')} icon="history" />

        {/* Filtros */}
        <SectionCard title={t('HISTORY.FILTERS')} icon="filter-list">
          <ChipTabs<HistoryFilter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: t('HISTORY.ALL') },
              { value: 'active', label: t('HISTORY.ACTIVE') },
              { value: 'completed', label: t('HISTORY.COMPLETED') },
              { value: 'cancelled', label: t('HISTORY.CANCELLED') },
            ]}
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('HISTORY.DATE')}</Text>
          <View style={styles.dates}>
            <DateInput value={dateFrom} onChange={setDateFrom} />
            <MaterialIcons name="arrow-forward" size={18} color={colors.textMuted} />
            <DateInput value={dateTo} onChange={setDateTo} />
          </View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('HISTORY.SEARCH_LABEL')}</Text>
          <SearchInput value={search} onChange={setSearch} placeholder={t('HISTORY.SEARCH_PLACEHOLDER')} />
        </SectionCard>

        {vm.loading && vm.bookings.length === 0 ? (
          <EmptyState loading title={t('MOBILE_NAV.LOADING')} />
        ) : vm.loadError ? (
          <EmptyState
            icon="cloud-off"
            title={t('HISTORY.LOAD_ERROR')}
            subtitle={vm.loadError}
            actionLabel={t('MOBILE_NAV.RETRY')}
            onAction={vm.reload}
          />
        ) : visible.length === 0 ? (
          <EmptyState icon="search-off" title={t('HISTORY.EMPTY')} />
        ) : (
          visible.map((booking) => (
            <SectionCard key={booking.id}>
              <View style={styles.header}>
                <MaterialIcons name="receipt-long" size={26} color={colors.primary} />
                <View style={styles.flex}>
                  <Text style={[styles.title, { color: colors.text }]}>{booking.code}</Text>
                  <Text style={[styles.date, { color: colors.textMuted }]}>
                    {booking.displayDate} · {booking.timeRange}
                  </Text>
                </View>
                <Text style={[styles.price, { color: colors.text }]}>{formatCOP(booking.total)}</Text>
              </View>

              <InfoRow label={t('HISTORY_CARD.TYPE')} value={booking.services.join(' / ')} />
              <InfoRow label={t('HISTORY_CARD.VEHICLE')} value={`${booking.vehicle || '—'}${booking.plate ? ` · ${booking.plate}` : ''}`} />
              <InfoRow label={t('HISTORY_CARD.STATUS')} value={t(`STATUS.${booking.status}`)} />

              <View style={styles.actions}>
                {booking.canPay ? (
                  <ActionButton
                    small
                    label={t('HISTORY_CARD.PAY_NOW')}
                    icon="arrow-forward"
                    iconRight
                    onPress={() => navigation.navigate('ClientPayment', { bookingId: booking.id })}
                  />
                ) : null}
                {booking.canCancel ? (
                  <ActionButton small variant="outline" label={t('HISTORY_CARD.CANCEL')} icon="cancel" onPress={() => requestCancel(booking)} />
                ) : null}
                {booking.canRate && !booking.rating ? (
                  <ActionButton small variant="outline" label={t('HISTORY_CARD.RATE')} icon="star-outline" onPress={() => setRating(booking)} />
                ) : null}
                {booking.rating ? (
                  // ya calificado: la calificación es una sola vez (regla de operations-service)
                  <ActionButton
                    small
                    variant="soft"
                    label={`${t('HISTORY_CARD.RATED')} ★ ${booking.rating}`}
                    icon="star"
                    onPress={() => undefined}
                  />
                ) : null}
              </View>
            </SectionCard>
          ))
        )}
      </ScreenScroll>

      <RatingModal
        visible={rating !== null}
        initial={rating?.rating ? { rating: rating.rating, comment: rating.ratingComment ?? '' } : null}
        onClose={() => setRating(null)}
        onSubmit={saveRating}
      />
      {feedback.modals}
    </ClientLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  label: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
  dates: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold },
  date: { fontSize: fontSize.small },
  price: { fontSize: fontSize.cardTitle, fontWeight: fontWeight.extrabold },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
});
