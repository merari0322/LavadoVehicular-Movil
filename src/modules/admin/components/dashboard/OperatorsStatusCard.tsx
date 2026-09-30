import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { DASHBOARD_TEXTS } from '../../constants/dashboardTexts';
import { OperatorStatus, OperatorStatusValue } from '../../types/dashboard.types';
import { CardLink } from './CardLink';

interface OperatorsStatusCardProps {
  operators: OperatorStatus[];
  countByStatus: (status: OperatorStatusValue) => number;
  statusLabel: (status: OperatorStatusValue) => string;
  onManageShifts: () => void;
}

export function OperatorsStatusCard({ operators, countByStatus, statusLabel, onManageShifts }: OperatorsStatusCardProps) {
  const { colors } = useTheme();
  const texts = DASHBOARD_TEXTS.operators;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.head}>
        <View style={styles.titleRow}>
          <MaterialIcons name="groups" size={18} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text>
        </View>
        <Text style={[styles.muted, { color: colors.textSecondary }]}>{texts.staff(operators.length)}</Text>
      </View>

      <View style={[styles.summary, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={[styles.summaryItem, { color: colors.text }]}>
          {countByStatus('available')} {texts.available}
        </Text>
        <Text style={[styles.summaryItem, { color: colors.text }]}>
          {countByStatus('busy')} {texts.busy}
        </Text>
        <Text style={[styles.summaryItem, { color: colors.text }]}>
          {countByStatus('leave')} {texts.leave}
        </Text>
      </View>

      {operators.map((o) => {
        const tone = o.status === 'leave' ? colors.error : colors.primary;
        const soft = o.status === 'leave' ? colors.errorSoft : colors.primarySoft;
        return (
          <View key={o.id} style={[styles.row, { borderTopColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: soft }]}>
              <Text style={{ color: tone, fontWeight: '700', fontSize: 12 }}>{o.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{o.name}</Text>
              <Text style={[styles.role, { color: colors.textSecondary }]}>{o.role}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: soft }]}>
              <Text style={{ color: tone, fontSize: 10, fontWeight: '600' }}>
                {o.status === 'busy' && o.bay ? o.bay : statusLabel(o.status)}
              </Text>
            </View>
          </View>
        );
      })}

      <CardLink label={texts.manageShifts} onPress={onManageShifts} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  head: { marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '700' },
  muted: { fontSize: 11, marginTop: 2 },
  summary: { flexDirection: 'row', justifyContent: 'space-around', borderWidth: 1, borderRadius: 999, paddingVertical: 8, marginBottom: 4 },
  summaryItem: { fontSize: 11, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: 1 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600' },
  role: { fontSize: 11 },
  pill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
});
