import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { SUPPORTED_LANGUAGES, SupportedLanguage, setAppLanguage } from '../../../app/config/i18n';
import { useTheme } from '../../../app/theme';

// misma bandera que getFlagCode() en navbar.ts (en -> bandera de Reino Unido)
const LANGUAGE_META: Record<SupportedLanguage, { label: string; flag: string }> = {
  es: { label: 'Español', flag: '🇪🇸' },
  en: { label: 'English', flag: '🇬🇧' },
  pt: { label: 'Português', flag: '🇵🇹' },
  fr: { label: 'Français', flag: '🇫🇷' },
};

export function LanguageSwitcher() {
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = i18n.language as SupportedLanguage;

  const handleSelect = async (lang: SupportedLanguage) => {
    await setAppLanguage(lang);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        style={[styles.trigger, { backgroundColor: colors.itemHover, borderColor: colors.border }]}
      >
        <Text style={styles.flag}>{LANGUAGE_META[currentLanguage].flag}</Text>
        <Text style={[styles.triggerText, { color: colors.text }]}>{currentLanguage.toUpperCase()}</Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Pressable
                key={lang}
                onPress={() => handleSelect(lang)}
                style={[styles.option, { backgroundColor: lang === currentLanguage ? colors.itemHover : 'transparent' }]}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.flag}>{LANGUAGE_META[lang].flag}</Text>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>{LANGUAGE_META[lang].label}</Text>
                </View>
                {lang === currentLanguage && <Text style={[styles.check, { color: colors.primary }]}>✓</Text>}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  triggerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  flag: {
    fontSize: 15,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 90,
    paddingRight: 16,
  },
  menu: {
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  check: {
    fontSize: 16,
    fontWeight: '700',
  },
});
