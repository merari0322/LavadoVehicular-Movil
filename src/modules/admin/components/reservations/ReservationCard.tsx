import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { TEXTS } from '../../constants/reservationTexts';
import { Reservation } from '../../models/reservation';
import { useOperatorDirectory } from '../../viewmodels/useOperatorDirectory';
import { getServiceById, useReservationCatalog } from '../../services/reservationCatalog';
import { addMinutes, formatDateLabel, getInitials } from '../../utils/reservationUtils';
import { StatusBadge } from '../common/StatusBadge';

interface ReservationCardProps {
  reservation: Reservation;
  onView: (reservation: Reservation) => void; // Se ejecuta al tocar el ojito
  // abre el modal "Asignar operario" (solo se muestra si la reserva no tiene operario)
  onAssign?: (reservation: Reservation) => void;
}

// Tarjeta de una reserva (en móvil reemplaza a la fila de la tabla)
export function ReservationCard({ reservation, onView, onAssign }: ReservationCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // repinta la tarjeta cuando llega el catálogo (nombres de servicios y bahías)
  useReservationCatalog();

  const service = getServiceById(reservation.serviceId);
  const operator = useOperatorDirectory().find((item) => item.id === reservation.operatorId);
  const endTime = addMinutes(reservation.time, reservation.duration);

  return (
    <View style={styles.card}>
      {/* Cliente + botón ver detalle */}
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text style={styles.customer}>{reservation.customerName}</Text>
          <Text style={styles.secondary}>{reservation.phone}</Text>
        </View>
        <Pressable style={styles.eyeButton} onPress={() => onView(reservation)} hitSlop={8}>
          <MaterialIcons name="visibility" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      {/* Vehículo, placa y servicio */}
      <View style={styles.topRow}>
        <Text style={[styles.vehicle, styles.flex]}>{reservation.vehicle}</Text>
        <View style={styles.plateChip}>
          <Text style={styles.plateText}>{reservation.plate}</Text>
        </View>
      </View>
      <View style={styles.serviceRow}>
        <View style={styles.dot} />
        <Text style={styles.serviceText}>{service?.name ?? '-'}</Text>
      </View>

      <View style={styles.divider} />

      {/* Fecha, hora y código */}
      <Text style={styles.schedule}>
        {formatDateLabel(reservation.date)} · {reservation.time} - {endTime}
      </Text>
      <Text style={styles.secondary}>{reservation.code}</Text>

      {/* Operario y estado */}
      <View style={styles.bottomRow}>
        {operator ? (
          <View style={styles.operatorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(operator.name)}</Text>
            </View>
            <Text style={styles.operatorName}>{operator.name}</Text>
          </View>
        ) : onAssign && reservation.status !== 'cancelled' && reservation.status !== 'completed' ? (
          <Pressable style={styles.assignButton} onPress={() => onAssign(reservation)} hitSlop={6}>
            <MaterialIcons name="person-add" size={16} color={colors.onPrimary} />
            <Text style={styles.assignText}>{TEXTS.list.assign}</Text>
          </Pressable>
        ) : (
          <View style={[styles.unassigned, { backgroundColor: colors.warningSoft }]}>
            <Text style={[styles.unassignedText, { color: colors.warning }]}>
              {TEXTS.filters.unassigned}
            </Text>
          </View>
        )}
        <StatusBadge status={reservation.status} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    card: {
      padding: 16,
      gap: 4,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    customer: { fontSize: 16, fontWeight: '700', color: colors.text },
    secondary: { fontSize: 13, color: colors.textSecondary },
    eyeButton: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    divider: { height: 1, marginVertical: 10, backgroundColor: colors.border },
    vehicle: { fontSize: 15, fontWeight: '700', color: colors.text },
    plateChip: {
      paddingVertical: 3,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: withAlpha(colors.textMuted, 0.15),
    },
    plateText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
    serviceText: { fontSize: 14, color: colors.text },
    schedule: { fontSize: 15, fontWeight: '700', color: colors.text },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    operatorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    avatarText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    operatorName: { fontSize: 13, fontWeight: '600', color: colors.text },
    unassigned: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999 },
    unassignedText: { fontSize: 12, fontWeight: '700' },
    assignButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    assignText: { fontSize: 12, fontWeight: '700', color: colors.onPrimary },
  });
