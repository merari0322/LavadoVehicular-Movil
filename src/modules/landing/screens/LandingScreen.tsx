import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, LayoutChangeEvent, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '../../../app/theme';
import { Contact } from '../components/Contact';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { Services } from '../components/Services';
import { LandingScreenProps, LandingSectionKey } from '../types/landing.types';

export function LandingScreen({ onLoginPress, onRegisterPress }: LandingScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const scrollViewRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<LandingSectionKey, number>>({
    nosotros: 0,
    servicios: 0,
    contacto: 0,
  });

  const registerSectionOffset = useCallback(
    (section: LandingSectionKey) => (event: LayoutChangeEvent) => {
      sectionOffsets.current[section] = event.nativeEvent.layout.y;
    },
    []
  );

  const scrollToSection = useCallback((section: LandingSectionKey) => {
    scrollViewRef.current?.scrollTo({ y: sectionOffsets.current[section], animated: true });
  }, []);

  const handleLoginPress =
    onLoginPress ?? (() => Alert.alert(t('NAV.LOGIN'), t('COMMON.COMING_SOON')));
  const handleRegisterPress =
    onRegisterPress ?? (() => Alert.alert(t('NAV.REGISTER'), t('COMMON.COMING_SOON')));

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Navbar onLoginPress={handleLoginPress} onRegisterPress={handleRegisterPress} />

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} bounces={false}>
        <Hero onRegisterPress={handleRegisterPress} onLoginPress={handleLoginPress} />

        <View onLayout={registerSectionOffset('nosotros')}>
          <Features />
        </View>

        <View onLayout={registerSectionOffset('servicios')}>
          <Services onSelectPlan={handleRegisterPress} />
        </View>

        <View onLayout={registerSectionOffset('contacto')}>
          <Contact onCtaPress={handleRegisterPress} />
        </View>

        <Footer onNavigate={scrollToSection} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
