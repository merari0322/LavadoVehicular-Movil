import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../app/theme';

const CONTACT_CARDS = [
  { icon: 'mail', labelKey: 'CONTACT.EMAIL_LABEL', value: 'hola@aquawash.com' },
  { icon: 'call', labelKey: 'CONTACT.PHONE_LABEL', value: '+57 300 123 4567' },
  { icon: 'public', labelKey: 'CONTACT.COVERAGE_LABEL', valueKey: 'CONTACT.COVERAGE_VALUE' },
] as const;

interface ContactProps {
  onCtaPress: () => void;
}

export function Contact({ onCtaPress }: ContactProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.section, { backgroundColor: colors.bg }]}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>{t('CONTACT.EYEBROW')}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{t('CONTACT.TITLE')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('CONTACT.SUBTITLE')}</Text>

      <View style={styles.grid}>
        {CONTACT_CARDS.map((card) => (
          <View key={card.labelKey} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
              <MaterialIcons name={card.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t(card.labelKey)}</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {'valueKey' in card ? t(card.valueKey) : card.value}
            </Text>
          </View>
        ))}
      </View>

      <Pressable onPress={onCtaPress} style={[styles.cta, { backgroundColor: colors.primary }]}>
        <Text style={styles.ctaText}>{t('CONTACT.CTA')}</Text>
        <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    alignItems: 'flex-start',
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
    gap: 12,
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: 'center',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
