import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { ProfileCard, ProfileUser } from '../../../shared/components/ui/ProfileCard';

// TODO: reemplazar por los datos reales del usuario (API / auth service)
const MOCK_USER: ProfileUser = {
  name: 'Laura Méndez',
  email: 'laura.mendez@lavadovehicular.co',
  phone: '3124908821',
  address: 'Calle 127 #19A-48, Bogotá, Colombia',
  initials: 'LM',
  memberSince: 'Marzo 2019',
};

export const AdminProfileScreen = () => {
  // Aquí se conectarán las acciones reales (guardar, cambiar contraseña, eliminar)
  const handleSave = (values: unknown) => {
    console.log('Save profile:', values);
  };

  return (
    <AdminLayout activeKey="profile">
      {/* SafeAreaView evita que el título quede debajo de la barra de estado */}
      <SafeAreaView edges={['top']} style={styles.container}>
        <ProfileCard user={MOCK_USER} onSave={handleSave} />
      </SafeAreaView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
