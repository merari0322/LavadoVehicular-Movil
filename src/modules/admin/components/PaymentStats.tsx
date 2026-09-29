import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { withAlpha } from '../../../shared/utils/color';
import { PAYMENT_TEXTS } from '../constants/paymentTexts';
import { PaymentStatsData } from '../models/payment';
import { formatCurrency, formatCOP } from '../utils/paymentUtils';

type Tone = 'warning' | 'error' | 'success' | 'primary';

interface StatCardProps {
  label: string;
  value: string;
  badge?: string;
  tone?: Tone;
}

// Tarjeta individual de estadística
function StatCard({ label, value, badge, tone = 'primary' }: StatCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Colores de la etiqueta inferior según el tono
  const tones: Record<Tone, { background: string; text: string }> = {
    warning: { background: colors.warningSoft, text: colors.warning },
    error: { background: colors.errorSoft, text: colors.error },
    success: { background: colors.successSoft, text: colors.success },
    primary: { background: withAlpha(colors.primary, 0.15), text: colors.primaryHover },
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: tones[tone].background }]}>
          <Text style={[styles.badgeText, { color: tones[tone].text }]}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

// Cuadrícula de 2x2 con las estadísticas de pagos
export function PaymentStats({ stats }: { stats: PaymentStatsData }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const texts = PAYMENT_TEXTS.stats;

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatCard
          label={texts.pending}
          value={String(stats.pending)}
          badge={stats.pending > 0 ? texts.pendingBadge : undefined}
          tone="warning"
        />
        <StatCard
          label={texts.approved}
          value={String(stats.approved)}
          badge={formatCOP(stats.collected)}
          tone="success"
        />
      </View>
      <View style={styles.row}>
        <StatCard
          label={texts.rejected}
          value={String(stats.rejected)}
          badge={stats.rejected > 0 ? texts.rejectedBadge : undefined}
          tone="error"
        />
        <StatCard
          label={texts.collected}
          value={formatCurrency(stats.collected)}
          badge={texts.transactions(stats.transactions)}
          tone="primary"
        />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    grid: { gap: 12 },
    row: { flexDirection: 'row', gap: 12 },
    card: {
      flex: 1,
      minHeight: 112,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    label: { fontSize: 12, color: colors.textSecondary },
    value: { marginTop: 4, fontSize: 30, fontWeight: '800', color: colors.text },
    badge: { alignSelf: 'flex-start', marginTop: 6, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999 },
    badgeText: { fontSize: 11, fontWeight: '700' },
  });
