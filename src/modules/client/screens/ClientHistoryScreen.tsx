import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, spacing, useTheme } from '../../../app/theme';
import { RootStackParamList } from '../../../core/navigation/types';
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
import { ClientHistoryItem } from '../models/client';
import { CLIENT_HISTORY } from '../services/clientMock';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientHistory'>;
type PaidFilter = 'all' | 'paid' | 'pending';

// historial de servicios del cliente con filtros, pagar pendientes y calificar
export function ClientHistoryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const feedback = useFeedback();

  const [services, setServices] = useState<ClientHistoryItem[]>(CLIENT_HISTORY);
  const [filter, setFilter] = useState<PaidFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState<ClientHistoryItem | null>(null);

  const visible = useMemo(() => {
    const from = displayToISO(dateFrom);
    const to = displayToISO(dateTo);
    const text = search.trim().toLowerCase();

    return services.filter((service) => {
      if (filter === 'paid' && !service.paid) return false;
      if (filter === 'pending' && service.paid) return false;

      // las fechas del historial vienen como dd/mm/aaaa
      const serviceDate = displayToISO(service.date) ?? '';
      if (from && serviceDate < from) return false;
      if (to && serviceDate > to) return false;

      if (text) {
        return (
          t(`SERVICE.${service.serviceType}`).toLowerCase().includes(text) ||
          t(`ASSIGNMENT.${service.assignmentType}`).toLowerCase().includes(text) ||
          service.operator.toLowerCase().includes(text)
        );
      }
      return true;
    });
  }, [services, filter, dateFrom, dateTo, search, t]);

  const saveRating = (result: RatingResult) => {
    if (!rating) return;
    const isEdit = Boolean(rating.rating);
    // TODO: guardar la calificación en booking-service cuando exista
    setServices((prev) =>
      prev.map((item) => (item.id === rating.id ? { ...item, rating: result.rating, ratingComment: result.comment } : item)),
    );
    setRating(null);
    feedback.showStatusAfterClose({
      title: t(isEdit ? 'RATINGS.UPDATED_TITLE' : 'RATINGS.SUCCESS_TITLE'),
      message: t(isEdit ? 'RATINGS.UPDATED_MESSAGE' : 'RATINGS.SUCCESS_MESSAGE'),
    });
  };

  return (
    <ClientLayout activeKey="history">
      <ScreenScroll>
        <PageHeader title={t('SIDEBAR.HISTORY')} icon="history" />

        {/* Filtros */}
        <SectionCard title={t('HISTORY.FILTERS')} icon="filter-list">
          <ChipTabs<PaidFilter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: t('HISTORY.ALL') },
              { value: 'paid', label: t('HISTORY.PAID') },
              { value: 'pending', label: t('HISTORY.PENDING') },
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

        {visible.length === 0 ? (
          <EmptyState icon="search-off" title={t('HISTORY.EMPTY')} />
        ) : (
          visible.map((service) => (
            <SectionCard key={service.id}>
              <View style={styles.header}>
                <MaterialIcons name="check-circle" size={26} color={service.paid ? colors.success : colors.warning} />
                <View style={styles.flex}>
                  <Text style={[styles.title, { color: colors.text }]}>{t(`SERVICE.${service.serviceType}`)}</Text>
                  <Text style={[styles.date, { color: colors.textMuted }]}>{service.date}</Text>
                </View>
                <Text style={[styles.price, { color: colors.text }]}>{formatCOP(service.price)}</Text>
              </View>

              <InfoRow label={t('HISTORY_CARD.TYPE')} value={t(`SERVICE.${service.serviceType}`)} />
              <InfoRow label={t('HISTORY_CARD.EXTRA')} value={service.extras.map((extra) => t(`EXTRA.${extra}`)).join(' / ')} />
              <InfoRow
                label={t('HISTORY_CARD.OPERATOR')}
                value={`${t(`ASSIGNMENT.${service.assignmentType}`)}${service.operator ? ` (${service.operator})` : ''}`}
              />
              <InfoRow label={t('HISTORY_CARD.STATUS')} value={t(`STATUS.${service.status}`)} />

              <View style={styles.actions}>
                {service.paid ? (
                  <Pill label={t('HISTORY_CARD.PAID')} tone="success" icon="check" />
                ) : (
                  <>
                    <Pill label={t('HISTORY_CARD.PENDING')} tone="warning" icon="schedule" />
                    <ActionButton
                      small
                      label={t('HISTORY_CARD.PAY_NOW')}
                      icon="arrow-forward"
                      iconRight
                      onPress={() => navigation.navigate('ClientPayment')}
                    />
                  </>
                )}
                {service.paid && !service.rating ? (
                  <ActionButton small variant="outline" label={t('HISTORY_CARD.RATE')} icon="star-outline" onPress={() => setRating(service)} />
                ) : null}
                {service.rating ? (
                  // ya calificado: al tocarlo se puede editar
                  <ActionButton
                    small
                    variant="soft"
                    label={`${t('HISTORY_CARD.RATED')} ★ ${service.rating}`}
                    icon="edit"
                    iconRight
                    onPress={() => setRating(service)}
                  />
                ) : null}
              </View>
            </SectionCard>
          ))
        )}
      </ScreenScroll>

      <RatingModal
        visible={rating !== null}
        initial={rating?.rating ? { rating: rating.rating, comment: rating.ratingComment } : null}
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
