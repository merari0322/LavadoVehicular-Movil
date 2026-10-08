import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { apiErrorKey, slotAlternatives } from '../../../core/api/apiError';
import { RootStackParamList } from '../../../core/navigation/types';
import { bookingService } from '../../../core/services/booking/BookingService';
import { AvailabilityResponse, CatalogServiceResponse } from '../../../core/services/booking/booking.types';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { InfoRow } from '../../../shared/components/screen/InfoRow';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { vehicleIcon } from '../../../shared/constants/business';
import { useEstablishment } from '../../../shared/services/establishmentCatalog';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { withAlpha } from '../../../shared/utils/color';
import { formatCOP, isoToDisplay, toISODate } from '../../../shared/utils/format';
import { VehicleCard } from '../models/client';
import { useClientVehicles } from '../viewmodels/useClientVehicles';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientReserve'>;

// se puede reservar desde hoy hasta 60 días; en el celular se muestran las próximas 2 semanas
const DAYS_AHEAD = 14;

// el precio y la duración dependen del tipo de vehículo: tarifas que trae el booking-service
function priceFor(service: CatalogServiceResponse, vehicleTypeId: number): number {
  return service.prices.find((price) => price.vehicleTypeId === vehicleTypeId)?.price ?? service.prices[0]?.price ?? 0;
}

function minutesFor(service: CatalogServiceResponse, vehicleTypeId: number): number {
  return (
    service.prices.find((price) => price.vehicleTypeId === vehicleTypeId)?.estimatedMinutes ??
    service.prices[0]?.estimatedMinutes ??
    0
  );
}

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

// reservar lavado en 3 pasos: vehículo (reales del cliente), servicio (catálogo real) y
// fecha/hora (disponibilidad real del booking-service, RF-006). La reserva se crea de verdad.
export function ClientReserveScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { vehicles, loading } = useClientVehicles();
  const feedback = useFeedback();
  const establishment = useEstablishment();

  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // catálogo real: con el vehicleTypeId solo vienen las tarifas de ese tipo de vehículo
  const [services, setServices] = useState<CatalogServiceResponse[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // disponibilidad real del día: horario, excepciones y solapamientos (RF-006)
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? null;
  const selectedService = services.find((s) => s.id === serviceId) ?? null;
  const total = vehicle && selectedService ? priceFor(selectedService, vehicle.typeId) : 0;
  const duration = vehicle && selectedService ? minutesFor(selectedService, vehicle.typeId) : 0;
  const isValid = Boolean(vehicle && selectedService && date && time);

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

  // al elegir un vehículo se cargan los servicios con la tarifa de su tipo de vehículo
  useEffect(() => {
    setServiceId(null);
    setTime('');
    setAvailability(null);
    if (!vehicle) {
      setServices([]);
      setServicesError(null);
      return;
    }
    let cancelled = false;
    setServicesLoading(true);
    setServicesError(null);
    bookingService
      .services(vehicle.typeId)
      .then((list) => {
        if (!cancelled) setServices(list);
      })
      .catch((error) => {
        if (!cancelled) setServicesError(t(apiErrorKey(error)));
      })
      .finally(() => {
        if (!cancelled) setServicesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vehicle, t]);

  const fetchSlots = useCallback(
    async (chosenVehicle: VehicleCard, chosenService: CatalogServiceResponse, chosenDate: string) => {
      setSlotsLoading(true);
      setSlotsError(null);
      try {
        const data = await bookingService.availability(chosenDate, chosenVehicle.typeId, [chosenService.id]);
        setAvailability(data);
        // si la hora elegida dejó de estar disponible (p. ej. tras un 409), se limpia
        setTime((current) => (data.slots.some((slot) => slot.time === current && slot.available) ? current : ''));
      } catch (error) {
        setAvailability(null);
        setSlotsError(t(apiErrorKey(error)));
      } finally {
        setSlotsLoading(false);
      }
    },
    [t],
  );

  // cada vez que cambia vehículo, servicio o fecha se consulta la disponibilidad real
  useEffect(() => {
    setTime('');
    if (!vehicle || !selectedService || !date) {
      setAvailability(null);
      return;
    }
    void fetchSlots(vehicle, selectedService, date);
  }, [vehicle, selectedService, date, fetchSlots]);

  const availableSlots = availability?.slots.filter((slot) => slot.available) ?? [];
  const closedDay = availability !== null && !availability.open;

  const submit = async () => {
    if (!vehicle || !selectedService || !date || !time) return;
    setSubmitting(true);
    try {
      // la reserva se crea de verdad en el booking-service: el cliente sale del token
      const booking = await bookingService.createBooking({
        vehicleId: vehicle.id,
        serviceIds: [selectedService.id],
        date,
        time,
        notes: null,
      });
      feedback.showStatus(
        {
          title: t('RESERVE.SUCCESS_TITLE'),
          message: t('RESERVE.SUCCESS_MESSAGE'),
          buttonText: t('RESERVE.SUCCESS_BUTTON'),
          details: [
            { label: t('RESERVE.SUMMARY.VEHICLE'), value: `${vehicle.brand} ${vehicle.model}` },
            { label: t('RESERVE.SUMMARY.PLATE'), value: vehicle.plate },
            { label: t('RESERVE.SUMMARY.SERVICE'), value: selectedService.name },
            { label: t('RESERVE.SUMMARY.DATE'), value: isoToDisplay(booking.date) },
            { label: t('RESERVE.SUMMARY.TIME'), value: booking.startTime },
            { label: t('RESERVE.SUMMARY.LOCATION'), value: establishment.address },
            { label: t('RESERVE.SUMMARY.TOTAL'), value: formatCOP(booking.total) },
          ],
        },
        // el siguiente paso del flujo es pagar la reserva
        () => navigation.navigate('ClientPayment'),
      );
    } catch (error) {
      // 409 SLOT_UNAVAILABLE: el backend propone hasta 5 horas libres del mismo día (RF-006)
      const alternatives = slotAlternatives(error);
      if (alternatives && vehicle && selectedService) {
        setTime('');
        void fetchSlots(vehicle, selectedService, date);
      }
      feedback.showError(t(apiErrorKey(error)));
    } finally {
      setSubmitting(false);
    }
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

        {/* Paso 2: servicio (catálogo real con el precio de ese tipo de vehículo) */}
        <SectionCard>
          <StepTitle number={2} title={t('RESERVE.STEP2.TITLE')} subtitle={t('RESERVE.STEP2.SUBTITLE')} />
          {!vehicle ? (
            <EmptyState icon="directions-car" title={t('RESERVE.STEP2.NO_VEHICLE')} />
          ) : servicesLoading ? (
            <EmptyState loading title={t('MOBILE_NAV.LOADING')} />
          ) : servicesError ? (
            <EmptyState icon="error-outline" title={servicesError} />
          ) : services.length === 0 ? (
            <EmptyState icon="miscellaneous-services" title={t('RESERVE.STEP2.EMPTY')} />
          ) : (
            services.map((item) => {
              const active = item.id === serviceId;
              const price = priceFor(item, vehicle.typeId);
              const minutes = minutesFor(item, vehicle.typeId);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setServiceId(item.id)}
                  style={[
                    styles.service,
                    { borderColor: active ? colors.primary : colors.border },
                    active && { backgroundColor: withAlpha(colors.primary, 0.08) },
                  ]}
                >
                  <View style={styles.serviceTop}>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>{item.name}</Text>
                  </View>
                  <Text style={[styles.price, { color: colors.primary }]}>{formatCOP(price)}</Text>
                  <View style={styles.row}>
                    <MaterialIcons name="schedule" size={15} color={colors.textMuted} />
                    <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                      {t('RESERVE.SUMMARY.DURATION')}: {minutes} min
                    </Text>
                  </View>
                  {item.description ? (
                    <Text style={[styles.optionSubtitle, { color: colors.text }]}>{item.description}</Text>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </SectionCard>

        {/* Paso 3: fecha, hora (real) y lugar */}
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
          {slotsLoading ? (
            <EmptyState loading title={t('MOBILE_NAV.LOADING')} />
          ) : slotsError ? (
            <EmptyState icon="error-outline" title={slotsError} />
          ) : closedDay ? (
            <Text style={[styles.note, { color: colors.textSecondary }]}>{t('RESERVE.STEP3.CLOSED')}</Text>
          ) : availableSlots.length === 0 ? (
            <Text style={[styles.note, { color: colors.textSecondary }]}>{t('RESERVE.STEP3.NO_SLOTS')}</Text>
          ) : (
            <View style={styles.timeGrid}>
              {availableSlots.map((slot) => {
                const active = slot.time === time;
                return (
                  <Pressable key={slot.time} onPress={() => setTime(slot.time)} style={[chip(active), styles.timeChip]}>
                    <Text style={[styles.timeText, { color: active ? colors.onPrimary : colors.text }]}>{slot.time}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* el cliente lleva su vehículo a la sede (no es a domicilio) */}
          <View style={[styles.location, { backgroundColor: withAlpha(colors.primary, 0.08) }]}>
            <MaterialIcons name="storefront" size={24} color={colors.primary} />
            <View style={styles.flex}>
              <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{t('RESERVE.LOCATION.TITLE')}</Text>
              <Text style={[styles.optionTitle, { color: colors.text }]}>{establishment.tradeName}</Text>
              <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{establishment.address}</Text>
            </View>
          </View>
        </SectionCard>

        {/* Resumen */}
        <SectionCard title={t('RESERVE.SUMMARY.TITLE')} icon="receipt-long">
          <InfoRow label={t('RESERVE.SUMMARY.VEHICLE')} value={vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.PLATE')} value={vehicle?.plate ?? '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.SERVICE')} value={selectedService?.name ?? '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.DURATION')} value={selectedService ? `${duration} min` : '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.DATE')} value={date ? isoToDisplay(date) : '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.TIME')} value={time || '—'} />
          <InfoRow label={t('RESERVE.SUMMARY.LOCATION')} value={establishment.tradeName} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label={t('RESERVE.SUMMARY.TOTAL')} value={total ? formatCOP(total) : '$—'} strong />
          <ActionButton
            label={t('RESERVE.SUMMARY.SUBMIT')}
            icon="arrow-forward"
            iconRight
            disabled={!isValid || submitting}
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