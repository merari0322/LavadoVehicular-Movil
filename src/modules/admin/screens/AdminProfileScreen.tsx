import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { ProfileView } from '../../../shared/screens/ProfileView';

// perfil real del administrador (mismo componente que cliente y operario)
export const AdminProfileScreen = () => {
  // vuelve a pintar la pantalla cuando cambia el idioma
  useTranslation();
  return (
    <AdminLayout activeKey="profile">
      {/* SafeAreaView evita que el título quede debajo de la barra de estado */}
      <SafeAreaView edges={['top']} style={styles.container}>
        <ProfileView />
      </SafeAreaView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
