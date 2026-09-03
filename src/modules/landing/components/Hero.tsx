import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../../app/theme';
import { NAVBAR_HEIGHT } from './Navbar';

interface HeroProps {
  onRegisterPress: () => void;
  onLoginPress: () => void;
}

export function Hero({ onRegisterPress, onLoginPress }: HeroProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <ImageBackground source={colors.heroImage} style={styles.background} resizeMode="cover">
      <LinearGradient
        colors={[colors.overlayDark, colors.overlayLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: NAVBAR_HEIGHT + 40 }]}>
        <View style={styles.badge}>
          <MaterialIcons name="settings" size={16} color="#ffffff" />
          <Text style={styles.badgeText}>{t('HERO.BADGE')}</Text>
        </View>

        <Text style={styles.title}>
          {t('HERO.TITLE_1')}
          {'\n'}
          {t('HERO.TITLE_2')}
        </Text>

        <Text style={styles.description}>{t('HERO.DESCRIPTION')}</Text>

        <View style={styles.buttons}>
          <Pressable onPress={onRegisterPress} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{t('HERO.START')}</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#131C20" />
          </Pressable>
          <Pressable onPress={onLoginPress} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{t('HERO.ALREADY_ACCOUNT')}</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    minHeight: 560,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 38,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 21,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#131C20',
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
