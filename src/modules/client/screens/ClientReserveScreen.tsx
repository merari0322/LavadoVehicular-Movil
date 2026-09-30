import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { RootStackParamList } from '../../../core/navigation/types';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { InfoRow } from '../../../shared/components/screen/InfoRow';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { BUSINESS_LOCATION, SERVICE_PRICES, SERVICE_TYPES, vehicleIcon } from '../../../shared/constants/business';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { withAlpha } from '../../../shared/utils/color';
import { formatCOP, isoToDisplay, toISODate } from '../../../shared/utils/format';
import { useClientVehicles } from '../viewmodels/useClientVehicles';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientReserve'>;

const MOST_POPULAR = 'PREMIUM';
// se puede reservar desde hoy hasta 60 días; en el celular se muestran las próximas 2 semanas
const DAYS_AHEAD = 14;
// horario de atención: 8:00 a 18:00
const TIMES = Array.from({ length: 11 }, (_, index) => `${String(8 + index).padStart(2, '0')}:00`);

// número de paso con su título (".step-title" de la web)
function StepTitle({ number, title, subtitle }: { number: number; title: string; subtitle: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stepTitle}>
      <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
        <Text style={[styles.stepNumberText, { color: colors.onPrimary }]}>{number}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={[styles.stepHeading, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

// reservar lavado en 3 pasos: vehículo (reales del cliente), servicio y fecha/hora
export function ClientReserveScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { vehicles, loading } = useClientVehicles();
  const feedback = useFeedback();

  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? null;
  const total = SERVICE_PRICES[service] ?? 0;
  const isValid = Boolean(vehicle && service && date && time);

  // próximos días con el nombre corto del día en el idioma actual
  const days = useMemo(() => {
    const shortDays = t('CALENDAR.DAYS_SHORT', { returnObjects: true }) as string[];
    return Array.from({ length: DAYS_AHEAD }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() + index);
      return {
        iso: toISODate(day),
        weekDay: shortDays[(day.getDay() + 6) % 7] ?? '',
        dayNumber: day.getDate(),
      };
    });
    // i18n.language: los nombres cambian con el idioma
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language]);

  const submit = () => {
    if (!vehicle || !isValid) return;

    // TODO: enviar la reserva a booking-service cuando exista (la web tampoco la guarda aún)
    feedback.showStatus(
      {
        title: t('RESERVE.SUCCESS_TITLE'),
        message: t('RESERVE.SUCCESS_MESSAGE'),
        buttonText: t('RESERVE.SUCCESS_BUTTON'),
        details: [
          { label: t('RESERVE.SUMMARY.VEHICLE'), value: `${vehicle.brand} ${vehicle.model}` },
          { label: t('RESERVE.SUMMARY.PLATE'), value: vehicle.plate },
          { label: t('RESERVE.SUMMARY.SERVICE'), value: t(`SERVICE.${service}`) },
          { label: t('RESERVE.SUMMARY.DATE'), value: isoToDisplay(date) },
          { label: t('RESERVE.SUMMARY.TIME'), value: time },
          { label: t('RESERVE.SUMMARY.LOCATION'), value: BUSINESS_LOCATION.address },
          { label: t('RESERVE.SUMMARY.TOTAL'), value: formatCOP(total) },
        ],
      },
      // el siguiente paso del flujo es pagar la reserva
      () => navigation.navigate('ClientPayment'),
    );
  };

  const chip = (active: boolean) => [
    styles.chip,
    active
      ? { backgroundColor: colors.primary, borderColor: colors.primary }
      : { backgroundColor: colors.card, borderColor: colors.border },
  ];

  return (
    <ClientLayout activeKey="reserve">
      <ScreenScroll>
        <PageHeader title={t('RESERVE.TITLE')} subtitle={t('RESERVE.SUBTITLE')} />

        {/* Paso 1: vehículo */}
        <SectionCard>
          <StepTitle number={1} title={t('RESERVE.STEP1.TITLE')} subtitle={t('RESERVE.STEP1.SUBTITLE')} />
          {loading ? (
            <EmptyState loading title={t('MOBILE_NAV.LOADING')} />
          ) : (
            vehicles.map((v) => {
              const active = v.id === vehicleId;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => setVehicleId(v.id)}
                  style={[
                    styles.option,
                    { borderColor: active ? colors.primary : colors.border },
                    active && { backgroundColor: withAlpha(colors.primary, 0.08) },
                  ]}
                >
                  <View style={[styles.optionIcon, { backgroundColor: withAlpha(colors.primary, 0.15) }]}>
                    <MaterialIcons name={vehicleIcon(v.type)} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>
                      {v.brand} {v.model}
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                      {t(`VEHICLE.${v.type}`)} · {v.plate}
                    </Text>
                  </View>
                  {active ? <MaterialIcons name="check-circle" size={22} color={colors.primary} /> : null}
                </Pressable>
              );
            })
          )}
          <Text style={[styles.note, { color: colors.textSecondary }]}>
            {t('RESERVE.STEP1.NO_VEHICLE')}{' '}
            <Text style={{ color: colors.primary, fontWeight: fontWeight.bold }} onPress={() => navigation.navigate('ClientVehicles')}>
              {t('RESERVE.STEP1.NO_VEHICLE_LINK')}
            </Text>
            .
          </Text>
        </SectionCard>

        {/* Paso 2: servicio */}
        <SectionCard>
          <StepTitle number={2} title={t('RESERVE.STEP2.TITLE')} subtitle={t('RESERVE.STEP2.SUBTITLE')} />
          {SERVICE_TYPES.map((type) => {
            const active = type === service;
            const items = t(`SERVICE.${type}_ITEMS`, { returnObjects: true }) as string[];
            return (
              <Pressable
                key={type}
                onPress={() => setService(type)}
                style={[
                  styles.service,
                  { borderColor: active ? colors.primary : colors.border },
                  active && { backgroundColor: withAlpha(colors.primary, 0.08) },
                ]}
              >
                <View style={styles.serviceTop}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>{t(`SERVICE.${type}`)}</Text>
                  {type === MOST_POPULAR ? (
                    <View style={[styles.popular, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.popularText, { color: colors.onPrimary }]}>{t('RESERVE.STEP2.POPULAR')}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.price, { color: colors.primary }]}>{formatCOP(SERVICE_PRICES[type])}</Text>
                <View style={styles.row}>
                  <MaterialIcons name="schedule" size={15} color={colors.textMuted} />
                  <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{t(`SERVICE.${type}_TIME`)}</Text>
                </View>
                {Array.isArray(items)
                  ? items.map((item) => (
                      <View key={item} style={styles.row}>
                        <MaterialIcons name="check-circle" size={15} color={colors.success} />
                        <Text style={[styles.optionSubtitle, { color: colors.text }]}>{item}</Text>
                      </View>
                    ))
                  : null}
              </Pressable>
            );
          })}
        </SectionCard>

        {/* Paso 3: fecha, hora y lugar */}
        <SectionCard>
          <StepTitle number={3} title={t('RESERVE.STEP3.TITLE')} subtitle={t('RESERVE.STEP3.SUBTITLE')} />
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('RESERVE.DATE')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {days.map((day) => {
              const active = day.iso === date;
              return (
                <Pressable key={day.iso} onPress={() => setDate(day.iso)} style={[chip(active), styles.dayChip]}>
                  <Text style={[styles.weekDay, { color: active ? colors.onPrimary : colors.textSecondary }]}>{day.weekDay}</Text>
                  <Text style={[styles.dayNumber, { color: active ? colors.onPrimary : colors.text }]}>{day.dayNumber}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('RESERVE.TIME')}</Text>
          <View style={styles.timeGrid}>
            {TIMES.map((hour) => {
              const active = hour === time;
              return (
                <Pressable key={hour} onPress={() => setTime(hour)} style={[chip(active), styles.timeChip]}>
                  <Text style={[styles.timeText, { color: active ? colors.onPrimary : colors.text }]}>{hour}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* el cliente lleva su vehículo a la sede (no es a domicilio) */}
          <View style={[styles.location, { backgroundColor: withAlpha(colors.primary, 0.08) }]}>
            <MaterialIcons name="storefront" size={24} color={colors.primary} />
            <View style={styles.flex}>
              <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{t('RESERVE.LOCATION.TITLE')}</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>{BUSINESS_LOCATION.name}</Text>
              <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{BUSINESS_LOCATION.address}</Text>
            </View>
          </View>
        </SectionCard>

        {/* Resumen */}
        <SectionCard title={t('RESERVE.SUMMARY.TITLE')} icon="receipt-long">
          <InfoRow label={t('RESERVE.SUMMARY.VEHICLE')} value={vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.PLATE')} value={vehicle?.plate ?? '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.SERVICE')} value={service ? t(`SERVICE.${service}`) : '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.DURATION')} value={service ? t(`SERVICE.${service}_TIME`) : '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.DATE')} value={date ? isoToDisplay(date) : '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.TIME')} value={time || '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.LOCATION')} value={BUSINESS_LOCATION.name} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label={t('RESERVE.SUMMARY.TOTAL')} value={total ? formatCOP(total) : '$—'} strong />
          <ActionButton
            label={t('RESERVE.SUMMARY.SUBMIT')}
            icon="arrow-forward"
            iconRight
            disabled={!isValid}
            onPress={submit}
          />
          <Text style={[styles.note, { color: colors.textMuted }]}>{t('RESERVE.SUMMARY.NOTE')}</Text>
        </SectionCard>
      </ScreenScroll>
      {feedback.modals}
    </ClientLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepNumber: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: fontSize.body, fontWeight: fontWeight.extrabold },
  stepHeading: { fontSize: fontSize.cardTitle, fontWeight: fontWeight.bold },
  stepSubtitle: { fontSize: fontSize.small },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5 },
  optionIcon: { width: 42, height: 42, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold },
  optionSubtitle: { fontSize: fontSize.small },
  note: { fontSize: fontSize.small, lineHeight: 19 },
  service: { gap: 6, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5 },
  serviceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  popular: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  popularText: { fontSize: fontSize.tiny, fontWeight: fontWeight.bold },
  price: { fontSize: fontSize.pageTitle - 2, fontWeight: fontWeight.extrabold },
  label: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
  chips: { gap: 8 },
  chip: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: radius.md },
  dayChip: { width: 56, paddingVertical: 10 },
  weekDay: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
  dayNumber: { fontSize: fontSize.cardTitle, fontWeight: fontWeight.extrabold },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { width: '22%', flexGrow: 1, height: 40 },
  timeText: { fontSize: fontSize.small, fontWeight: fontWeight.semibold },
  location: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md },
  divider: { height: 1 },
});
