import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { SupportedLanguage, setAppLanguage } from '../../app/config/i18n';
import { ThemeName, fontSize, fontWeight, radius, spacing, useTheme } from '../../app/theme';
import { LegalDocumentModal, LegalDocumentType } from '../components/feedback/LegalDocumentModal';
import { PageHeader } from '../components/screen/PageHeader';
import { ScreenScroll } from '../components/screen/ScreenScroll';
import { SectionCard } from '../components/screen/SectionCard';
import { useEstablishment } from '../services/establishmentCatalog';
import { useFeedback } from '../hooks/useFeedback';
import { withAlpha } from '../utils/color';

type IconName = keyof typeof MaterialIcons.glyphMap;

// preferencias de notificaciones guardadas en el celular (misma llave que la web)
const NOTIFICATIONS_KEY = '@lavado_vehicular/notificationSettings';
interface NotificationSettings {
  push: boolean;
  email: boolean;
  promo: boolean;
}
const DEFAULT_SETTINGS: NotificationSettings = { push: true, email: true, promo: false };

// miniaturas de los 4 temas (colores solo para la vista previa)
const THEMES: { name: ThemeName; accent: string; surface: string; line: string }[] = [
  { name: 'green', accent: '#2ec4b6', surface: '#f4f4f4', line: '#dadada' },
  { name: 'greenDark', accent: '#2ec4b6', surface: '#3a3a3a', line: '#5a5a5a' },
  { name: 'pink', accent: '#ff4fa3', surface: '#f4f4f4', line: '#dadada' },
  { name: 'pinkDark', accent: '#ff4fa3', surface: '#3a3a3a', line: '#5a5a5a' },
];

const LANGUAGES: { code: SupportedLanguage; name: string; flag: string; subtitle: string }[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸', subtitle: 'Interfaz en español' },
  { code: 'en', name: 'English', flag: '🇬🇧', subtitle: 'Interface in english' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', subtitle: 'Interface en français' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', subtitle: 'Interface em português' },
];

// configuración de cliente y operario (<app-settings-panel> de la web): notificaciones,
// tema e idioma (se aplican y quedan guardados de verdad) y ayuda / documentos legales
export function SettingsView() {
  const { colors, themeName, setThemeName } = useTheme();
  const { t, i18n } = useTranslation();
  const feedback = useFeedback();
  const establishment = useEstablishment();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [legal, setLegal] = useState<LegalDocumentType | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFICATIONS_KEY)
      .then((raw) => {
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<NotificationSettings>) });
      })
      .catch(() => undefined);
  }, []);

  const toggle = (key: keyof NotificationSettings) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next)).catch(() => undefined);
  };

  const openHelpCenter = () =>
    feedback.showStatus({
      type: 'info',
      icon: 'support-agent',
      title: t('CONFIG.HELP_CENTER'),
      message: t('CONFIG.HELP_MODAL.MESSAGE'),
      buttonText: t('COMMON.CLOSE'),
      details: [
        // el negocio solo tiene un teléfono: se muestra como WhatsApp y como línea de atención
        { label: t('CONFIG.HELP_MODAL.WHATSAPP'), value: establishment.phone ?? '—' },
        { label: t('CONFIG.HELP_MODAL.SUPPORT_LINE'), value: establishment.phone ?? '—' },
        { label: t('CONFIG.HELP_MODAL.EMAIL'), value: establishment.email ?? '—' },
        { label: t('CONFIG.HELP_MODAL.HOURS'), value: t('CONFIG.HELP_MODAL.HOURS_VALUE') },
        { label: t('CONFIG.HELP_MODAL.ADDRESS'), value: establishment.address },
      ],
    });

  const toggleRow = (key: keyof NotificationSettings, title: string, subtitle: string) => (
    <View style={styles.item}>
      <View style={styles.flex}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{t(title)}</Text>
        <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{t(subtitle)}</Text>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={() => toggle(key)}
        trackColor={{ false: colors.border, true: withAlpha(colors.primary, 0.5) }}
        thumbColor={settings[key] ? colors.primary : '#f4f4f4'}
      />
    </View>
  );

  const helpRow = (icon: IconName, label: string, onPress: () => void) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}>
      <MaterialIcons name={icon} size={22} color={colors.primary} />
      <Text style={[styles.itemTitle, styles.flex, { color: colors.text }]}>{t(label)}</Text>
      <Text style={[styles.open, { color: colors.primary }]}>{t('CONFIG.OPEN')}</Text>
      <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
    </Pressable>
  );

  const divider = <View style={[styles.divider, { backgroundColor: colors.border }]} />;

  return (
    <>
      <ScreenScroll>
        <PageHeader title={t('CONFIG.TITLE')} icon="settings" />

        <SectionCard title={t('CONFIG.NOTIFICATIONS')} icon="notifications">
          {toggleRow('push', 'CONFIG.PUSH', 'CONFIG.PUSH_DESC')}
          {divider}
          {toggleRow('email', 'CONFIG.EMAIL', 'CONFIG.EMAIL_DESC')}
          {divider}
          {toggleRow('promo', 'CONFIG.PROMO', 'CONFIG.PROMO_DESC')}
        </SectionCard>

        <SectionCard title={t('CONFIG.APPEARANCE')} icon="public">
          <Text style={[styles.itemTitle, { color: colors.text }]}>{t('CONFIG.THEME')}</Text>
          <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{t('CONFIG.THEME_DESC')}</Text>
          <View style={styles.themes}>
            {THEMES.map((theme) => {
              const active = theme.name === themeName;
              return (
                <Pressable
                  key={theme.name}
                  onPress={() => setThemeName(theme.name)}
                  style={[
                    styles.theme,
                    { backgroundColor: theme.surface, borderColor: active ? colors.primary : colors.border },
                    active && styles.themeActive,
                  ]}
                >
                  <View style={[styles.themeTop, { backgroundColor: theme.accent }]}>
                    {active ? <MaterialIcons name="check-circle" size={16} color="#ffffff" /> : null}
                  </View>
                  <View style={[styles.themeLine, styles.themeLineSmall, { backgroundColor: theme.line }]} />
                  <View style={[styles.themeLine, { backgroundColor: theme.line }]} />
                </Pressable>
              );
            })}
          </View>

          {divider}

          <Text style={[styles.itemTitle, { color: colors.text }]}>{t('CONFIG.LANGUAGE')}</Text>
          <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{t('CONFIG.LANGUAGE_DESC')}</Text>
          {LANGUAGES.map((language) => {
            const active = i18n.language === language.code;
            return (
              <Pressable
                key={language.code}
                onPress={() => void setAppLanguage(language.code)}
                style={[
                  styles.language,
                  { borderColor: active ? colors.primary : colors.border },
                  active && { backgroundColor: withAlpha(colors.primary, 0.08) },
                ]}
              >
                <Text style={styles.flag}>{language.flag}</Text>
                <View style={styles.flex}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{language.name}</Text>
                  <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{language.subtitle}</Text>
                </View>
                <MaterialIcons
                  name={active ? 'check-circle' : 'radio-button-unchecked'}
                  size={22}
                  color={active ? colors.primary : colors.textMuted}
                />
              </Pressable>
            );
          })}
        </SectionCard>

        <SectionCard title={t('CONFIG.HELP')} icon="help-outline">
          {helpRow('help', 'CONFIG.HELP_CENTER', openHelpCenter)}
          {divider}
          {helpRow('description', 'CONFIG.VIEW_TERMS', () => setLegal('terms'))}
          {divider}
          {helpRow('privacy-tip', 'CONFIG.VIEW_PRIVACY', () => setLegal('privacy'))}
        </SectionCard>
      </ScreenScroll>

      <LegalDocumentModal type={legal} onClose={() => setLegal(null)} />
      {feedback.modals}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemTitle: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  itemSubtitle: { fontSize: fontSize.caption, marginTop: 2 },
  open: { fontSize: fontSize.small, fontWeight: fontWeight.semibold },
  divider: { height: 1 },
  themes: { flexDirection: 'row', gap: spacing.sm },
  theme: { flex: 1, height: 74, padding: 6, gap: 6, borderRadius: radius.md, borderWidth: 1.5 },
  themeActive: { borderWidth: 2.5 },
  themeTop: { height: 22, borderRadius: 6, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 4 },
  themeLine: { height: 6, borderRadius: 3 },
  themeLineSmall: { width: '60%' },
  language: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5 },
  flag: { fontSize: 24 },
});
