import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LogoMark } from '../../../shared/components/LogoMark';
import { useTheme } from '../../../app/theme';
import { LandingSectionKey } from '../types/landing.types';

interface FooterProps {
  onNavigate: (section: LandingSectionKey) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <View style={[styles.footer, { backgroundColor: colors.bgSoft, borderTopColor: colors.border }]}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <LogoMark size={20} color={colors.primary} />
          <Text style={[styles.logoText, { color: colors.text }]}>{t('APP.TITLE')}</Text>
        </View>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{t('FOOTER.DESCRIPTION')}</Text>
      </View>

      <FooterColumn title={t('FOOTER.COMPANY.TITLE')}>
        <FooterLink label={t('FOOTER.COMPANY.ABOUT')} onPress={() => onNavigate('nosotros')} />
        <FooterLink label={t('FOOTER.COMPANY.CAREERS')} onPress={() => onNavigate('contacto')} />
        <FooterLink label={t('FOOTER.COMPANY.CONTACT')} onPress={() => onNavigate('contacto')} />
      </FooterColumn>

      <FooterColumn title={t('FOOTER.SERVICES_TITLE')}>
        <FooterLink label={t('SERVICE.BASIC')} onPress={() => onNavigate('servicios')} />
        <FooterLink label={t('SERVICE.PREMIUM')} onPress={() => onNavigate('servicios')} />
        <FooterLink label={t('SERVICE.FULL')} onPress={() => onNavigate('servicios')} />
      </FooterColumn>

      <FooterColumn title={t('FOOTER.SUPPORT.TITLE')}>
        <FooterLink label={t('CONFIG.HELP_CENTER')} />
        <FooterLink label={t('FOOTER.SUPPORT.FAQ')} />
        <FooterLink label={t('FOOTER.LEGAL.TERMS')} />
        <FooterLink label={t('FOOTER.LEGAL.PRIVACY')} />
      </FooterColumn>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Text style={[styles.copyright, { color: colors.textMuted }]}>
        {t('FOOTER.COPYRIGHT', { year: currentYear })}
      </Text>
    </View>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.column}>
      <Text style={[styles.columnTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

// enlaces sin destino ("#" en la web) se muestran sin onPress, igual que en el origen
function FooterLink({ label, onPress }: { label: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Text style={[styles.link, { color: colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
    borderTopWidth: 1,
    gap: 24,
  },
  brand: {
    gap: 10,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
  },
  column: {
    gap: 10,
  },
  columnTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  link: {
    fontSize: 13,
  },
  divider: {
    height: 1,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
  },
});
