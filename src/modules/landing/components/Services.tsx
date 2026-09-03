import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../app/theme';

const PLANS = [
  {
    icon: 'local-car-wash',
    nameKey: 'SERVICE.BASIC',
    descKey: 'SERVICE.BASIC_DESC',
    priceKey: 'SERVICE.BASIC_PRICE',
    timeKey: 'SERVICE.BASIC_TIME',
    itemsKey: 'SERVICE.BASIC_ITEMS',
    popular: false,
  },
  {
    icon: 'workspace-premium',
    nameKey: 'SERVICE.PREMIUM',
    descKey: 'SERVICE.PREMIUM_DESC',
    priceKey: 'SERVICE.PREMIUM_PRICE',
    timeKey: 'SERVICE.PREMIUM_TIME',
    itemsKey: 'SERVICE.PREMIUM_ITEMS',
    popular: true,
  },
  {
    icon: 'auto-awesome',
    nameKey: 'SERVICE.FULL',
    descKey: 'SERVICE.FULL_DESC',
    priceKey: 'SERVICE.FULL_PRICE',
    timeKey: 'SERVICE.FULL_TIME',
    itemsKey: 'SERVICE.FULL_ITEMS',
    popular: false,
  },
] as const;

interface ServicesProps {
  onSelectPlan: () => void;
}

export function Services({ onSelectPlan }: ServicesProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.section, { backgroundColor: colors.bgSoft }]}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>{t('NAV.SERVICES')}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{t('RESERVE.STEP2.TITLE')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('RESERVE.STEP2.SUBTITLE')}</Text>

      <View style={styles.grid}>
        {PLANS.map((plan) => {
          const items = t(plan.itemsKey, { returnObjects: true }) as string[];
          return (
            <View
              key={plan.nameKey}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: plan.popular ? colors.primary : colors.border },
              ]}
            >
              {plan.popular && (
                <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.popularBadgeText}>{t('RESERVE.STEP2.POPULAR')}</Text>
                </View>
              )}

              <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
                <MaterialIcons name={plan.icon} size={22} color={colors.primary} />
              </View>

              <Text style={[styles.planName, { color: colors.text }]}>{t(plan.nameKey)}</Text>
              <Text style={[styles.planDesc, { color: colors.textSecondary }]}>{t(plan.descKey)}</Text>

              <Text style={[styles.price, { color: colors.text }]}>
                {t(plan.priceKey)} <Text style={[styles.time, { color: colors.textSecondary }]}>· {t(plan.timeKey)}</Text>
              </Text>

              <View style={styles.itemsList}>
                {items.map((item) => (
                  <View key={item} style={styles.itemRow}>
                    <MaterialIcons name="check-circle" size={16} color={colors.primary} />
                    <Text style={[styles.itemText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={onSelectPlan}
                style={[styles.cta, { backgroundColor: plan.popular ? colors.primary : colors.itemHover }]}
              >
                <Text style={[styles.ctaText, { color: plan.popular ? '#ffffff' : colors.text }]}>{t('HERO.START')}</Text>
                <MaterialIcons name="arrow-forward" size={16} color={plan.popular ? '#ffffff' : colors.text} />
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
    marginBottom: 20,
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    gap: 10,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planName: {
    fontSize: 17,
    fontWeight: '800',
  },
  planDesc: {
    fontSize: 13,
    marginTop: -4,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
  },
  time: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemsList: {
    gap: 8,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemText: {
    fontSize: 13,
    flexShrink: 1,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
