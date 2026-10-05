import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, spacing, useTheme } from '../../../app/theme';
import { Pill } from '../../../shared/components/ui/Pill';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { vehicleIcon } from '../../../shared/constants/business';
import { isoToDisplay } from '../../../shared/utils/format';
import { OperatorReservation, statusIcon, statusLabel, statusTone } from '../models/operator';

interface ReservationCardProps {
  reservation: OperatorReservation;
  // muestra la fecha además de la hora (vista de semana / realizados)
  showDate?: boolean;
  onStart: (reservation: OperatorReservation) => void;
  onFinish: (reservation: OperatorReservation) => void;
  onDetail: (reservation: OperatorReservation) => void;
}

// servicio asignado en una lista (tarjeta de "Servicios de hoy" y de "Mi Agenda")
export function ReservationCard({ reservation: r, showDate = false, onStart, onFinish, onDetail }: ReservationCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SectionCard>
      <View style={styles.top}>
        <View style={styles.time}>
          <MaterialIcons name="schedule" size={16} color={colors.primary} />
          <Text style={[styles.timeText, { color: colors.primary }]}>
            {showDate ? `${isoToDisplay(r.date)} · ` : ''}
            {r.time}
          </Text>
        </View>
        <Pill label={t(statusLabel(r.status))} tone={statusTone(r.status)} icon={statusIcon(r.status)} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {r.service} — {r.client}
      </Text>
      <View style={styles.detail}>
        <MaterialIcons name={vehicleIcon(r.vehicle)} size={16} color={colors.textMuted} />
        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
          {r.vehicleName} · {r.durationMin} min · {r.code}
        </Text>
      </View>

      <View style={styles.actions}>
        {r.status === 'pendiente' ? (
          <ActionButton small icon="play-arrow" label={t('SCHEDULE.START')} onPress={() => onStart(r)} />
        ) : null}
        {r.status === 'en_progreso' ? (
          <ActionButton small icon="check" label={t('SCHEDULE.FINISH')} onPress={() => onFinish(r)} />
        ) : null}
        <ActionButton small variant="outline" icon="visibility" label={t('SCHEDULE.VIEW_DETAIL')} onPress={() => onDetail(r)} />
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  time: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: fontSize.small, fontWeight: fontWeight.bold },
  title: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { flex: 1, fontSize: fontSize.small },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
