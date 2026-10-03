import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { DASHBOARD_TEXTS } from '../../constants/dashboardTexts';
import { Reservation } from '../../models/reservation';
import { getBayById, getServiceById, useReservationCatalog } from '../../services/reservationCatalog';
import { CardLink } from './CardLink';

// cuántas reservas se muestran en el inicio (el resto está en la pantalla de reservas)
const VISIBLE = 3;
// una cita es "próxima" si empieza dentro de la próxima hora
const UPCOMING_MINUTES = 60;

function minutesUntil(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  return hours * 60 + minutes - (now.getHours() * 60 + now.getMinutes());
}

interface UnassignedBookingsCardProps {
  bookings: Reservation[];
  onAssign: (reservation: Reservation) => void;
  onViewAll: () => void;
}

export function UnassignedBookingsCard({ bookings, onAssign, onViewAll }: UnassignedBookingsCardProps) {
  const { colors } = useTheme();
  const texts = DASHBOARD_TEXTS.unassigned;

  // repinta la tarjeta cuando llega el catálogo (nombres de servicios y bahías)
  useReservationCatalog();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <MaterialIcons name="assignment-ind" size={18} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text>
          </View>
          <Text style={[styles.muted, { color: colors.textSecondary }]}>{texts.subtitle}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.warningSoft }]}>
          <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '600' }}>{texts.badge(bookings.length)}</Text>
        </View>
      </View>

      {bookings.length === 0 ? <Text style={[styles.empty, { color: colors.textSecondary }]}>{texts.empty}</Text> : null}

      {bookings.slice(0, VISIBLE).map((r) => {
        const minutes = minutesUntil(r.time);
        const upcoming = minutes >= 0 && minutes <= UPCOMING_MINUTES;
        return (
          <View key={r.id} style={[styles.row, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <View style={[styles.tag, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    {r.time} · {getBayById(r.bayId)?.name ?? texts.noBay}
                  </Text>
                </View>
                {upcoming ? <Text style={[styles.muted, { color: colors.warning }]}>{texts.upcoming}</Text> : null}
              </View>
              <Text style={[styles.client, { color: colors.text }]}>
                {r.customerName} — {r.vehicle}
              </Text>
              <View style={styles.serviceRow}>
                <MaterialIcons name="local-car-wash" size={13} color={colors.primary} />
                <Text style={[styles.muted, { color: colors.primary }]}>{getServiceById(r.serviceId)?.name ?? '-'}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.assignBtn, { backgroundColor: colors.primary }]} onPress={() => onAssign(r)}>
              <MaterialIcons name="person-add" size={14} color={colors.onPrimary} />
              <Text style={[styles.assignText, { color: colors.onPrimary }]}>{texts.assign}</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <CardLink label={texts.viewAll} onPress={onViewAll} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  muted: { fontSize: 11, marginTop: 2 },
  empty: { fontSize: 12, textAlign: 'center', paddingVertical: 12 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  tag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 10, fontWeight: '600' },
  client: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  assignText: { fontSize: 11, fontWeight: '600' },
});
