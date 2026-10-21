import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { DASHBOARD_TEXTS } from '../../constants/dashboardTexts';
import { Reservation } from '../../models/reservation';
import { ToCloseItem } from '../../viewmodels/useReservations';

interface ToCloseCardProps {
  items: ToCloseItem[];
  operatorName: (operatorId: string) => string;
  onAttended: (reservation: Reservation, operator: string) => void;
  onNoShow: (reservation: Reservation) => void;
}

// reservas que terminaron con operario y nadie registró: el sistema no decide solo, las cierra el admin
// (igual que la tarjeta "Por cerrar" de la web). Solo se muestra cuando hay alguna.
export function ToCloseCard({ items, operatorName, onAttended, onNoShow }: ToCloseCardProps) {
  const { colors } = useTheme();
  const texts = DASHBOARD_TEXTS.toClose;
  if (items.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.warning }]}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <MaterialIcons name="pending-actions" size={18} color={colors.warning} />
            <Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text>
          </View>
          <Text style={[styles.muted, { color: colors.textSecondary }]}>{texts.subtitle}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.warningSoft }]}>
          <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '600' }}>{texts.badge(items.length)}</Text>
        </View>
      </View>

      {items.map(({ reservation: r, reason, operatorId }) => {
        const operator = operatorName(operatorId);
        const [, month, day] = r.date.split('-');
        return (
          <View key={r.id} style={[styles.row, { borderTopColor: colors.border }]}>
            <View style={styles.rowTop}>
              <View style={[styles.tag, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {day}/{month} · {r.time}
                </Text>
              </View>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>{r.code}</Text>
            </View>
            <Text style={[styles.client, { color: colors.text }]}>
              {r.customerName} — {r.vehicle}
            </Text>
            <View style={styles.reasonRow}>
              <MaterialIcons name="engineering" size={13} color={colors.textSecondary} />
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                {reason === 'NOT_STARTED' ? texts.notStarted(operator) : texts.notFinished(operator)}
              </Text>
            </View>
            <View style={styles.actions}>
              {reason === 'NOT_STARTED' ? (
                <TouchableOpacity
                  style={[styles.btn, styles.outline, { borderColor: colors.border }]}
                  onPress={() => onNoShow(r)}
                >
                  <MaterialIcons name="person-off" size={14} color={colors.text} />
                  <Text style={[styles.btnText, { color: colors.text }]}>{texts.noShow}</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={() => onAttended(r, operator)}
              >
                <MaterialIcons name="task-alt" size={14} color={colors.onPrimary} />
                <Text style={[styles.btnText, { color: colors.onPrimary }]}>{texts.attended}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  muted: { fontSize: 11, marginTop: 2, flexShrink: 1 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  row: { paddingVertical: 12, borderTopWidth: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  tag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 10, fontWeight: '600' },
  client: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  outline: { borderWidth: 1 },
  btnText: { fontSize: 11, fontWeight: '600' },
});
