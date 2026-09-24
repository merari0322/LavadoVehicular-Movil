import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { UnassignedBooking } from '../types/dashboard.types';

interface UnassignedBookingsCardProps {
  bookings: UnassignedBooking[];
}

export function UnassignedBookingsCard({ bookings }: UnassignedBookingsCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <MaterialIcons name="assignment_ind" size={18} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Reservas sin operario</Text>
          </View>
          <Text style={[styles.muted, { color: colors.textSecondary }]}>Servicios en espera de asignación</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.warningSoft }]}>
          <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '600' }}>{bookings.length} por asignar</Text>
        </View>
      </View>

      {bookings.map((r) => (
        <View key={r.time} style={[styles.row, { borderTopColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.rowTop}>
              <View style={[styles.tag, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {r.time} · {r.bay}
                </Text>
              </View>
              {r.isUpcoming && <Text style={[styles.muted, { color: colors.textSecondary }]}>Cita próxima</Text>}
            </View>
            <Text style={[styles.client, { color: colors.text }]}>
              {r.client} — {r.vehicle}
            </Text>
            <View style={styles.serviceRow}>
              <MaterialIcons name={r.icon as any} size={13} color={colors.primary} />
              <Text style={[styles.muted, { color: colors.primary }]}>{r.service}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.assignBtn, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="person_add" size={14} color={colors.onPrimary} />
            <Text style={[styles.assignText, { color: colors.onPrimary }]}>Asignar</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '700' },
  muted: { fontSize: 11, marginTop: 2 },
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
