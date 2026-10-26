import React from 'react';
import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme } from '../../../app/theme';

interface ScreenScrollProps {
  children: React.ReactNode;
  // si se pasa, la pantalla se puede recargar deslizando hacia abajo
  onRefresh?: () => void;
  refreshing?: boolean;
}

// contenido desplazable de las pantallas con barra inferior: respeta la barra de estado, deja
// espacio abajo para que la barra flotante no tape lo último y se recoge cuando sale el teclado
// para que no tape los campos ni los botones.
// Con edge-to-edge (Expo 57) Android ya no achica la ventana al abrir el teclado, por eso
// KeyboardAvoidingView usa 'padding' en las dos plataformas
export function ScreenScroll({ children, onRefresh, refreshing = false }: ScreenScrollProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView
          style={{ backgroundColor: colors.bg }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 130 },
});
