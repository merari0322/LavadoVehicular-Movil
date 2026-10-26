import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { TEXTS } from '../../constants/reservationTexts';
import { Reservation } from '../../models/reservation';
import { useOperatorDirectory } from '../../viewmodels/useOperatorDirectory';
import { getBayById, getServiceById, useReservationCatalog } from '../../services/reservationCatalog';
import { addMinutes, formatDateLabel, supportsInspection } from '../../utils/reservationUtils';
import { INSPECTION_TEXTS } from '../../constants/inspectionTexts';
import { StatusBadge } from '../common/StatusBadge';
import { ModalCloseButton } from '../../../../shared/components/feedback/ModalCloseButton';
import { ModalShell } from '../../../../shared/components/feedback/ModalShell';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface ReservationDetailModalProps {
  reservation: Reservation | null; // null = modal cerrado
  onClose: () => void;
  onEdit: (reservation: Reservation) => void;
  // abre el reporte de inspección (solo servicios largos en el lavadero)
  onInspect?: (reservation: Reservation) => void;
}

interface DetailRowProps {
  icon: IconName;
  label: string;
  value: string;
}

// Fila de información: icono + etiqueta + valor
function DetailRow({ icon, label, value }: DetailRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.detailRow}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

// Modal de solo lectura con toda la información de la reserva (el "ojito")
export function ReservationDetailModal({ reservation, onClose, onEdit, onInspect }: ReservationDetailModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // repinta el modal cuando llega el catálogo (nombres de servicios y bahías)
  useReservationCatalog();
  const operators = useOperatorDirectory();

  if (!reservation) return null;

  const service = getServiceById(reservation.serviceId);
  const bay = getBayById(reservation.bayId);
  const operator = operators.find((item) => item.id === reservation.operatorId);
  const endTime = addMinutes(reservation.time, reservation.duration);
  const detail = TEXTS.detail;

  return (
    <ModalShell visible={true} onRequestClose={onClose}>
      <View style={styles.sheet}>
        {/* Encabezado: código y estado */}
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={styles.title}>{reservation.code}</Text>
            <View style={styles.badgeWrapper}>
              <StatusBadge status={reservation.status} />
            </View>
          </View>
          <ModalCloseButton onPress={onClose} />
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <Text style={styles.sectionTitle}>{detail.customerSection}</Text>
          <DetailRow icon="person" label={detail.name} value={reservation.customerName} />
          <DetailRow icon="phone" label={detail.phone} value={reservation.phone} />
          <DetailRow icon="email" label={detail.email} value={reservation.email || detail.noEmail} />

          <Text style={styles.sectionTitle}>{detail.vehicleSection}</Text>
          <DetailRow icon="directions-car" label={detail.vehicle} value={reservation.vehicle} />
          <DetailRow icon="confirmation-number" label={detail.plate} value={reservation.plate} />
          <DetailRow icon="local-car-wash" label={detail.service} value={service?.name ?? '-'} />
          <DetailRow icon="timer" label={detail.duration} value={`${reservation.duration} min`} />

          <Text style={styles.sectionTitle}>{detail.scheduleSection}</Text>
          <DetailRow icon="event" label={detail.date} value={formatDateLabel(reservation.date)} />
          <DetailRow icon="schedule" label={detail.schedule} value={`${reservation.time} - ${endTime}`} />
          <DetailRow icon="local-parking" label={detail.bay} value={bay?.name ?? detail.noBay} />
          <DetailRow icon="groups" label={detail.operator} value={operator?.name ?? detail.unassigned} />

          <Text style={styles.sectionTitle}>{detail.notesSection}</Text>
          <DetailRow icon="notes" label={detail.notesSection} value={reservation.notes || detail.noNotes} />
        </ScrollView>

        {/* Reporte de inspección (servicios largos), como el botón "Inspección" de la web */}
        {onInspect && supportsInspection(reservation) ? (
          <Pressable
            style={({ pressed }) => [styles.inspectButton, pressed && styles.pressed]}
            onPress={() => onInspect(reservation)}
          >
            <MaterialIcons name="fact-check" size={20} color={colors.primary} />
            <Text style={styles.inspectText}>{INSPECTION_TEXTS.openFromDetail}</Text>
          </Pressable>
        ) : null}

        {/* Botones */}
        <View style={styles.footer}>
          <Pressable style={[styles.button, styles.closeButton]} onPress={onClose}>
            <Text style={styles.closeText}>{detail.close}</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.editButton]} onPress={() => onEdit(reservation)}>
            <Text style={styles.editText}>{detail.edit}</Text>
          </Pressable>
        </View>
      </View>
    </ModalShell>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    sheet: {
      maxHeight: '92%',
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 20, fontWeight: '800', color: colors.text },
    badgeWrapper: { marginTop: 8 },
    body: { flexShrink: 1 },
    bodyContent: { gap: 12, padding: 20 },
    sectionTitle: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: withAlpha(colors.primary, 0.12),
    },
    detailLabel: { fontSize: 12, color: colors.textSecondary },
    detailValue: { fontSize: 15, fontWeight: '600', color: colors.text },
    footer: {
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: { flex: 1, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    closeButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    closeText: { fontSize: 14, fontWeight: '700', color: colors.text },
    editButton: { backgroundColor: colors.primary },
    editText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
    inspectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 46,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: withAlpha(colors.primary, 0.08),
    },
    inspectText: { fontSize: 14, fontWeight: '700', color: colors.primary },
    pressed: { opacity: 0.85 },
  });
