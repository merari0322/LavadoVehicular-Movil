import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../app/theme';

const STATS = [
  { icon: 'directions-car', value: '15K+', labelKey: 'ABOUT.STATS.VEHICLES' },
  { icon: 'sentiment-satisfied', value: '8K+', labelKey: 'ABOUT.STATS.CLIENTS' },
  { icon: 'location-city', value: '12+', labelKey: 'ABOUT.STATS.CITIES' },
  { icon: 'military-tech', value: '5+', labelKey: 'ABOUT.STATS.YEARS' },
] as const;

const FEATURE_ITEMS = [
  { icon: 'water-drop', titleKey: 'FEATURES.ITEMS.ECO.TITLE', descKey: 'FEATURES.ITEMS.ECO.DESC' },
  { icon: 'shield', titleKey: 'FEATURES.ITEMS.PROTECTION.TITLE', descKey: 'FEATURES.ITEMS.PROTECTION.DESC' },
  { icon: 'star', titleKey: 'FEATURES.ITEMS.RATING.TITLE', descKey: 'FEATURES.ITEMS.RATING.DESC' },
] as const;

export function Features() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.section, { backgroundColor: colors.bg }]}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>{t('ABOUT.EYEBROW')}</Text>
      <Text style={[styles.aboutTitle, { color: colors.text }]}>{t('ABOUT.TITLE')}</Text>
      <Text style={[styles.aboutDescription, { color: colors.textSecondary }]}>{t('ABOUT.DESCRIPTION')}</Text>

      <View style={styles.statsGrid}>
        {STATS.map((stat) => (
          <View key={stat.labelKey} style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialIcons name={stat.icon} size={22} color={colors.primary} />
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t(stat.labelKey)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={[styles.eyebrow, { color: colors.primary }]}>{t('APP.TITLE')}</Text>
      <Text style={[styles.featuresTitle, { color: colors.text }]}>{t('FEATURES.TITLE')}</Text>
      <Text style={[styles.featuresSubtitle, { color: colors.textSecondary }]}>{t('FEATURES.SUBTITLE')}</Text>

      <View style={styles.featuresGrid}>
        {FEATURE_ITEMS.map((feature) => (
          <View key={feature.titleKey} style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialIcons name={feature.icon} size={22} color={colors.primary} />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>{t(feature.titleKey)}</Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>{t(feature.descKey)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  aboutDescription: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  statItem: {
    flexBasis: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
  },
  divider: {
    height: 32,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  featuresSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
    marginBottom: 8,
  },
  featuresGrid: {
    gap: 14,
    marginTop: 12,
  },
  featureCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
});
