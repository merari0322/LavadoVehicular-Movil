import React from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../app/theme';
import { AuthCard } from './AuthCard';
import { BackButton } from '../../../shared/components/ui/BackButton';

interface AuthScreenLayoutProps {
  children: React.ReactNode;
}

// layout común a Login/Register/ForgotPassword: evita repetir el mismo
// scroll + card centrada + back button en cada pantalla
export function AuthScreenLayout({ children }: AuthScreenLayoutProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    // 'padding' también en Android: con edge-to-edge la ventana no se achica con el teclado
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.bg }]} behavior="padding">
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <AuthCard>
          <BackButton />
          {children}
        </AuthCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
