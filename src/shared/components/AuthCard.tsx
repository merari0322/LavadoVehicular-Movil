import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../app/theme';

interface AuthCardProps {
  children: React.ReactNode;
}

// tarjeta blanca contenedora, equivalente a .login-card/.register-card/app-auth-card en la web
export function AuthCard({ children }: AuthCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
});
