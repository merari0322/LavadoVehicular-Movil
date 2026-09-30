import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, spacing, useTheme } from '../../../app/theme';
import { ChipTabs } from '../../../shared/components/screen/ChipTabs';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { DateInput } from '../../../shared/components/screen/FilterInputs';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ProgressBar } from '../../../shared/components/screen/ProgressBar';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { StatGrid, StatTile } from '../../../shared/components/screen/StatTile';
import { SERVICE_TYPES } from '../../../shared/constants/business';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { OperatorLayout } from '../../../shared/layouts/OperatorLayout';
import { displayToISO, isoToDisplay } from '../../../shared/utils/format';
import { RatingItem } from '../models/operator';
import { RATINGS } from '../services/operatorMock';

// estrellas llenas y vacías de una calificación
function Stars({ value }: { value: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialIcons key={star} name={star <= value ? 'star' : 'star-border'} size={18} color={colors.warning} />
      ))}
    </View>
  );
}

// calificaciones que los clientes dejaron sobre el trabajo del operario
export function OperatorRatingsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const feedback = useFeedback();
  const ratings = RATINGS;

  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [stars, setStars] = useState('');

  const average = ratings.length === 0 ? 0 : Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10;
  // satisfacción: porcentaje del promedio sobre 5 estrellas
  const satisfaction = Math.round((average / 5) * 100);

  const visible = useMemo(() => {
    const iso = displayToISO(date);
    return ratings.filter((r) => {
      if (iso && r.date !== iso) return false;
      if (type && r.service !== type) return false;
      if (stars && r.rating !== Number(stars)) return false;
      return true;
    });
  }, [ratings, date, type, stars]);

  const hasFilters = date !== '' || type !== '' || stars !== '';
  const clear = () => {
    setDate('');
    setType('');
    setStars('');
  };

  const viewDetail = (r: RatingItem) =>
    feedback.showStatus({
      type: 'info',
      icon: 'star',
      title: t('QUALIFICATION_CARD.DETAIL_TITLE'),
      message: t('QUALIFICATION_CARD.DETAIL_MESSAGE'),
      buttonText: t('COMMON.CLOSE'),
      details: [
        { label: t('BOOKING_DETAIL.CLIENT'), value: r.client },
        { label: t('BOOKING_DETAIL.SERVICE'), value: t(`SERVICE.${r.service}`) },
        { label: t('BOOKING_DETAIL.DATE'), value: isoToDisplay(r.date) },
        { label: t('SERVICE_HISTORY.DETAIL.RATING'), value: '★'.repeat(r.rating) },
        { label: t('QUALIFICATION_CARD.COMMENT'), value: `"${r.comment}"` },
        { label: t('QUALIFICATION_CARD.DURATION'), value: r.duration },
        { label: t('QUALIFICATION_CARD.ID'), value: r.serviceId },
      ],
    });

  return (
    <OperatorLayout activeKey="ratings">
      <ScreenScroll>
        <PageHeader title={t('QUALIFICATIONS.TITLE')} subtitle={t('QUALIFICATIONS.SUBTITLE')} />

        <StatGrid>
          <StatTile icon="star" value={average} label={t('QUALIFICATION_STATS.AVG_RATING')} />
          <StatTile icon="chat" value={ratings.length} label={t('QUALIFICATION_STATS.TOTAL')} />
        </StatGrid>
        <SectionCard title={t('QUALIFICATION_STATS.SATISFACTION_LEVEL')} icon="sentiment-satisfied-alt">
          <ProgressBar percentage={satisfaction} label={t('QUALIFICATION_STATS.LAST_12_MONTHS')} />
        </SectionCard>

        <SectionCard
          title={t('QUALIFICATIONS.FILTERS_TITLE')}
          icon="filter-list"
          right={
            hasFilters ? (
              <Pressable onPress={clear} hitSlop={8}>
                <MaterialIcons name="refresh" size={22} color={colors.primary} />
              </Pressable>
            ) : null
          }
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('QUALIFICATIONS.FILTER_DATE')}</Text>
          <DateInput value={date} onChange={setDate} />
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('QUALIFICATIONS.FILTER_TYPE')}</Text>
          <ChipTabs<string>
            value={type}
            onChange={setType}
            options={[
              { value: '', label: t('QUALIFICATIONS.TYPE_ALL') },
              ...SERVICE_TYPES.map((service) => ({ value: service, label: t(`SERVICE.${service}`) })),
            ]}
          />
          <ChipTabs<string>
            value={stars}
            onChange={setStars}
            options={[
              { value: '', label: t('QUALIFICATIONS.STARS_ALL') },
              ...[5, 4, 3, 2, 1].map((count) => ({ value: String(count), label: t(`QUALIFICATIONS.STARS_${count}`) })),
            ]}
          />
        </SectionCard>

        {visible.length === 0 ? (
          <EmptyState icon="star-border" title={t('QUALIFICATIONS.EMPTY')} />
        ) : (
          visible.map((r) => (
            <SectionCard key={r.id}>
              <Pressable onPress={() => viewDetail(r)} style={styles.card}>
                <View style={styles.top}>
                  <View style={styles.flex}>
                    <Text style={[styles.client, { color: colors.text }]}>{r.client}</Text>
                    <Text style={[styles.muted, { color: colors.textSecondary }]}>{t(`SERVICE.${r.service}`)}</Text>
                  </View>
                  <Text style={[styles.muted, { color: colors.textMuted }]}>{isoToDisplay(r.date)}</Text>
                  <MaterialIcons name="visibility" size={20} color={colors.primary} />
                </View>
                <Stars value={r.rating} />
                <Text style={[styles.comment, { color: colors.text }]}>"{r.comment}"</Text>
                <Text style={[styles.muted, { color: colors.textMuted }]}>
                  {t('QUALIFICATION_CARD.DURATION')}: {r.duration} · {t('QUALIFICATION_CARD.ID')}: {r.serviceId}
                </Text>
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
  flex: { flex: 1 },
  label: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
  card: { gap: spacing.sm },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  client: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold },
  muted: { fontSize: fontSize.small },
  stars: { flexDirection: 'row', gap: 2 },
  comment: { fontSize: fontSize.body, fontStyle: 'italic', lineHeight: 20 },
});
