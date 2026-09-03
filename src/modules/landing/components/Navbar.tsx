import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoMark } from '../../../shared/components/LogoMark';
import { useTheme } from '../../../app/theme';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  onLoginPress: () => void;
  onRegisterPress: () => void;
}

export const NAVBAR_HEIGHT = 64;

export function Navbar({ onLoginPress, onRegisterPress }: NavbarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 10,
          backgroundColor: colors.card + 'e6',
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.logo}>
        <LogoMark size={22} color={colors.primary} />
        <Text style={[styles.logoText, { color: colors.text }]}>{t('APP.TITLE')}</Text>
      </View>

      <View style={styles.actions}>
        <LanguageSwitcher />
        <Pressable onPress={onLoginPress} style={styles.loginButton}>
          <Text style={[styles.loginText, { color: colors.text }]}>{t('NAV.LOGIN')}</Text>
        </Pressable>
        <Pressable
          onPress={onRegisterPress}
          style={[styles.registerButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.registerText}>{t('NAV.REGISTER')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  loginText: {
    fontSize: 12,
    fontWeight: '600',
  },
  registerButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  registerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
