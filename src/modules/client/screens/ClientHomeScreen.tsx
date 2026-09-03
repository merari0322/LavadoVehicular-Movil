import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../app/theme';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { RootStackParamList } from '../../../core/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientHome'>;

// placeholder: el módulo client todavía no está construido, esto solo confirma
// que el flujo de autenticación termina en un destino real
export function ClientHomeScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 24 }]}>
      <Text style={[styles.title, { color: colors.text }]}>¡Bienvenido, {route.params.userName}!</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Aquí irá el panel del cliente (dashboard, reservas, historial...).
      </Text>
      <PrimaryButton
        label="Cerrar sesión"
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Landing' }] })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
});
