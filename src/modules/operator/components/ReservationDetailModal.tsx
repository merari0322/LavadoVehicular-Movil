import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { Pill } from '../../../shared/components/ui/Pill';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { InfoRow } from '../../../shared/components/screen/InfoRow';
import { isoToDisplay } from '../../../shared/utils/format';
import { formatCOP } from '../../../shared/utils/format';
import { OperatorReservation, statusIcon, statusLabel, statusTone } from '../models/operator';

interface ReservationDetailModalProps {
  // null = cerrado
  reservation: OperatorReservation | null;
  onClose: () => void;
  onStart: (reservation: OperatorReservation) => void;
  onFinish: (reservation: OperatorReservation) => void;
  onReport: (reservation: OperatorReservation) => void;
  onContact: (reservation: OperatorReservation) => void;
}

// detalle de un servicio asignado con sus acciones según el estado:
// pendiente -> iniciar · en progreso -> reportar o finalizar · siempre: contactar al cliente
export function ReservationDetailModal({
  reservation: r,
  onClose,
  onStart,
  onFinish,
  onReport,
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
    <Modal visible={r !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {r ? (
            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.header}>
                <Pill label={t(statusLabel(r.status))} tone={statusTone(r.status)} icon={statusIcon(r.status)} />
                <Text style={[styles.code, { color: colors.textMuted }]}>{r.code}</Text>
                <Pressable onPress={onClose} hitSlop={10}>
                  <MaterialIcons name="close" size={22} color={colors.text} />
                </Pressable>
              </View>

              <Text style={[styles.title, { color: colors.text }]}>
                {r.service} — {r.client}
              </Text>

              <InfoRow icon="event" label={t('SCHEDULE.DETAIL.DATE')} value={`${isoToDisplay(r.date)} · ${r.time}`} />
              <InfoRow icon="timer" label={t('SCHEDULE.DETAIL.DURATION')} value={`${r.durationMin} min`} />
              <InfoRow icon="directions-car" label={t('SCHEDULE.DETAIL.VEHICLE')} value={`${r.vehicleName} · ${r.plate}`} />
              <InfoRow icon="pin" label={t('BOOKING_DETAIL.PLATE')} value={r.plate} />
              <InfoRow icon="payments" label={t('ASSIGNED_SERVICES.DETAIL.PAYMENT_METHOD')} value={r.paymentMethod ? t(`SERVICE_HISTORY.METHODS.${r.paymentMethod}`) : formatCOP(r.total ?? 0)} />

              {r.status !== 'finalizado' ? (
                <Text style={[styles.section, { color: colors.textSecondary }]}>{t('ASSIGNED_SERVICES.DETAIL.PROGRESS_TITLE')}</Text>
              ) : null}
              {r.status === 'pendiente' ? (
                <ActionButton icon="play-circle-outline" label={t('ASSIGNED_SERVICES.DETAIL.START')} onPress={then(onStart)} />
              ) : null}
              {r.status === 'en_progreso' ? (
                <>
                  <ActionButton variant="soft" icon="refresh" label={t('ASSIGNED_SERVICES.DETAIL.REPORT')} onPress={then(onReport)} />
                  <ActionButton icon="flag" label={t('ASSIGNED_SERVICES.DETAIL.FINISH')} onPress={then(onFinish)} />
                </>
              ) : null}

              <Text style={[styles.section, { color: colors.textSecondary }]}>{t('ASSIGNED_SERVICES.DETAIL.EXTRA_TITLE')}</Text>
              <ActionButton variant="outline" icon="phone" label={t('ASSIGNED_SERVICES.DETAIL.CONTACT')} onPress={then(onContact)} />
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  card: { maxHeight: '88%', borderRadius: radius.xl, overflow: 'hidden' },
  content: { gap: spacing.md, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  code: { flex: 1, fontSize: fontSize.small, fontWeight: fontWeight.semibold, textAlign: 'right' },
  title: { fontSize: fontSize.cardTitle + 1, fontWeight: fontWeight.extrabold },
  section: { marginTop: 4, fontSize: fontSize.small, fontWeight: fontWeight.bold },
});
