import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../app/theme';
import { LogoMark } from './LogoMark';

// círculo con el primario suavizado detrás del logo, igual que .step-icon en la web
export function StepIcon() {
  const { colors } = useTheme();

  return (
    <View style={[styles.circle, { backgroundColor: colors.primarySoft }]}>
      <LogoMark size={28} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
});
