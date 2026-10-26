import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { Pill } from '../../../shared/components/ui/Pill';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { InfoRow } from '../../../shared/components/screen/InfoRow';
import { isoToDisplay } from '../../../shared/utils/format';
import { formatCOP } from '../../../shared/utils/format';
import { OperatorReservation, statusIcon, statusLabel, statusTone, canStartNow, startFromLabel, startWindow } from '../models/operator';
import { ModalCloseButton } from '../../../shared/components/feedback/ModalCloseButton';
import { ModalShell } from '../../../shared/components/feedback/ModalShell';

interface ReservationDetailModalProps {
  // null = cerrado
  reservation: OperatorReservation | null;
  onClose: () => void;
  onStart: (reservation: OperatorReservation) => void;
  onFinish: (reservation: OperatorReservation) => void;
  onContact: (reservation: OperatorReservation) => void;
}

// detalle de un servicio asignado con sus acciones según el estado:
// pendiente -> iniciar · en progreso -> reportar o finalizar · siempre: contactar al cliente
export function ReservationDetailModal({
  reservation: r,
  onClose,
  onStart,
  onFinish,
  onContact,
}: ReservationDetailModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // cierra el detalle y luego pide la confirmación de la acción. La espera evita abrir un
  // modal mientras el otro todavía se está cerrando (en iOS el segundo no aparecería)
  const then = (action: (reservation: OperatorReservation) => void) => () => {
    if (!r) return;
    const selected = r;
    onClose();
    setTimeout(() => action(selected), 300);
  };

  return (
    <ModalShell visible={r !== null} onRequestClose={onClose}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {r ? (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Pill label={t(statusLabel(r.status))} tone={statusTone(r.status)} icon={statusIcon(r.status)} />
              <Text style={[styles.code, { color: colors.textMuted }]}>{r.code}</Text>
              <ModalCloseButton onPress={onClose} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {r.service} — {r.client}
            </Text>

            <InfoRow icon="event" label={t('SCHEDULE.DETAIL.DATE')} value={`${isoToDisplay(r.date)} · ${r.time}`} />
            <InfoRow icon="timer" label={t('SCHEDULE.DETAIL.DURATION')} value={`${r.durationMin} min`} />
            <InfoRow icon="directions-car" label={t('SCHEDULE.DETAIL.VEHICLE')} value={`${r.vehicleName} · ${r.plate}`} />
            <InfoRow icon="pin" label={t('BOOKING_DETAIL.PLATE')} value={r.plate} />
            <InfoRow icon="payments" label={t('ASSIGNED_SERVICES.DETAIL.PAYMENT_METHOD')} value={r.paymentMethod ? t(`SERVICE_HISTORY.METHODS.${r.paymentMethod}`) : formatCOP(r.total ?? 0)} />
            {/* B-01: lo que el admin le pidió al operario al asignarle el servicio */}
            {r.notes ? (
              <InfoRow icon="notes" label={t('ASSIGNED_SERVICES.DETAIL.NOTES')} value={r.notes} />
            ) : null}

            {r.status !== 'finalizado' ? (
              <Text style={[styles.section, { color: colors.textSecondary }]}>{t('ASSIGNED_SERVICES.DETAIL.PROGRESS_TITLE')}</Text>
            ) : null}
            {r.status === 'pendiente' ? (
              <>
                <ActionButton icon="play-circle-outline" label={t('ASSIGNED_SERVICES.DETAIL.START')} disabled={!canStartNow(r)} onPress={then(onStart)} />
                {startWindow(r) === 'early' ? (
                  <Text style={[styles.section, { color: colors.textMuted }]}>
                    {t('OPERATOR_WORK.START_FROM', { time: startFromLabel(r) })}
                  </Text>
                ) : null}
                {/* pasaron más de 4 h de la hora de fin: operations-service ya no deja iniciarlo */}
                {startWindow(r) === 'late' ? (
                  <Text style={[styles.section, { color: colors.error }]}>{t('OPERATOR_WORK.START_TOO_LATE')}</Text>
                ) : null}
              </>
            ) : null}
            {r.status === 'en_progreso' ? (
              <>
                <ActionButton icon="flag" label={t('ASSIGNED_SERVICES.DETAIL.FINISH')} onPress={then(onFinish)} />
              </>
            ) : null}

            <Text style={[styles.section, { color: colors.textSecondary }]}>{t('ASSIGNED_SERVICES.DETAIL.EXTRA_TITLE')}</Text>
            <ActionButton variant="outline" icon="phone" label={t('ASSIGNED_SERVICES.DETAIL.CONTACT')} onPress={then(onContact)} />
          </ScrollView>
        ) : null}
      </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  card: { maxHeight: '88%', borderRadius: radius.xl, overflow: 'hidden' },
  content: { gap: spacing.md, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  code: { flex: 1, fontSize: fontSize.small, fontWeight: fontWeight.semibold, textAlign: 'right' },
  title: { fontSize: fontSize.cardTitle + 1, fontWeight: fontWeight.extrabold },
  section: { marginTop: 4, fontSize: fontSize.small, fontWeight: fontWeight.bold },
});
