import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme } from '../../../app/theme';

interface ScreenScrollProps {
  children: React.ReactNode;
  // si se pasa, la pantalla se puede recargar deslizando hacia abajo
  onRefresh?: () => void;
  refreshing?: boolean;
}

// contenido desplazable de las pantallas con barra inferior: respeta la barra de estado
// y deja espacio abajo para que la barra flotante no tape lo último
export function ScreenScroll({ children, onRefresh, refreshing = false }: ScreenScrollProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 130 },
});
