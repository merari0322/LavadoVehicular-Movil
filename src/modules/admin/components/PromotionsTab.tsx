import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { withAlpha } from '../../../shared/utils/color';
import { MANAGEMENT_TEXTS } from '../constants/managementTexts';
import { Promotion, PromotionMetrics, PromotionStatus } from '../models/management';
import { formatPercent } from '../utils/managementUtils';
import { formatCurrency, formatThousands } from '../utils/paymentUtils';
import {
  ActionIconButton,
  EmptyState,
  ManagementCard,
  Pill,
  PillTone,
  SectionHeader,
} from './ManagementParts';

interface PromotionsTabProps {
  promotions: Promotion[];
  metrics: PromotionMetrics;
  onCreate: () => void;
  onEdit: (promotion: Promotion) => void;
  onChangeStatus: (id: string, status: PromotionStatus) => void;
  onDelete: (promotion: Promotion) => void;
}

const texts = MANAGEMENT_TEXTS.promotions;

// Estado al que pasa la promoción al tocar el botón principal
const NEXT_STATUS: Record<PromotionStatus, PromotionStatus> = {
  active: 'paused',
  paused: 'active',
  scheduled: 'active',
};

// Color de la etiqueta de cada estado
const STATUS_TONE: Record<PromotionStatus, PillTone> = {
  active: 'success',
  paused: 'neutral',
  scheduled: 'warning',
};

// Pestaña de promociones: tarjetas de paquetes y métricas
export function PromotionsTab({
  promotions,
  metrics,
  onCreate,
  onEdit,
  onChangeStatus,
  onDelete,
}: PromotionsTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <SectionHeader
        title={texts.title}
        subtitle={texts.subtitle}
        actionLabel={texts.create}
        actionIcon="add"
        onAction={onCreate}
      />

      {promotions.length === 0 ? (
        <EmptyState title={texts.empty} hint={texts.emptyHint} />
      ) : (
        promotions.map((promotion) => (
          <ManagementCard key={promotion.id} highlighted={promotion.featured} style={styles.promoCard}>
            {/* Icono y etiquetas */}
            <View style={styles.topRow}>
              <View style={styles.iconBox}>
                <MaterialIcons name={promotion.icon} size={26} color={colors.primary} />
              </View>
              <View style={styles.pills}>
                {promotion.featured ? <Pill label={texts.featured} tone="primary" icon="star" /> : null}
                <Pill label={texts.status[promotion.status]} tone={STATUS_TONE[promotion.status]} />
              </View>
            </View>

            <Text style={styles.name}>{promotion.name}</Text>
            <Text style={styles.description}>{promotion.description}</Text>

            <Text style={styles.price}>
              {formatCurrency(promotion.price)}{' '}
              <Text style={styles.duration}>· {texts.duration(promotion.duration)}</Text>
            </Text>

            {/* Cupón y canjes */}
            <View style={styles.couponBox}>
              <Text style={styles.couponText}>
                {texts.coupon}: <Text style={styles.couponCode}>{promotion.coupon}</Text>
              </Text>
              <Text style={styles.description}>{texts.redemptions(promotion.redemptions)}</Text>
            </View>

            {/* Beneficios */}
            <View style={styles.benefits}>
              {promotion.benefits.map((benefit, index) => (
                <View key={`${benefit}-${index}`} style={styles.benefitRow}>
                  <MaterialIcons name="check" size={18} color={colors.primaryHover} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Botón principal: pausar, reanudar o comenzar */}
            <Pressable
              style={styles.mainButton}
              onPress={() => onChangeStatus(promotion.id, NEXT_STATUS[promotion.status])}
            >
              <Text style={styles.mainButtonText}>{texts.action[promotion.status]}</Text>
            </Pressable>

            <View style={styles.footer}>
              <Pressable onPress={() => onEdit(promotion)} hitSlop={8}>
                <Text style={styles.editLink}>{texts.editCard}</Text>
              </Pressable>
              <ActionIconButton icon="delete" danger onPress={() => onDelete(promotion)} />
            </View>
          </ManagementCard>
        ))
      )}

      {/* Métricas generales */}
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>{texts.metrics.redemptions}</Text>
          <Text style={styles.metricValue}>{formatThousands(metrics.redemptions)}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>{texts.metrics.savings}</Text>
          <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(metrics.savings)}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>{texts.metrics.conversion}</Text>
          <Text style={styles.metricValue}>{formatPercent(metrics.conversion)}</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 14 },
    promoCard: { gap: 6, padding: 18 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    iconBox: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    pills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6, flexShrink: 1 },
    name: { marginTop: 6, fontSize: 20, fontWeight: '800', color: colors.text },
    description: { fontSize: 13, color: colors.textSecondary },
    price: { marginTop: 6, fontSize: 26, fontWeight: '800', color: colors.text },
    duration: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
    couponBox: {
      gap: 2,
      marginTop: 6,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.08),
    },
    couponText: { fontSize: 14, color: colors.textSecondary },
    couponCode: { fontWeight: '800', color: colors.primary },
    benefits: { gap: 8, marginTop: 8 },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    benefitText: { flexShrink: 1, fontSize: 14, color: colors.textSecondary },
    mainButton: {
      height: 46,
      marginTop: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    mainButtonText: { fontSize: 15, fontWeight: '700', color: colors.onPrimary },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    editLink: { fontSize: 14, color: colors.primary },
    metrics: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    metric: { flex: 1, gap: 4 },
    metricLabel: { fontSize: 12, color: colors.textSecondary },
    metricValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  });
