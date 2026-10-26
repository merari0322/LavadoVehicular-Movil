import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { ProfileView } from '../../../shared/screens/ProfileView';

// perfil real del cliente (mismo componente que operario y administrador)
export function ClientProfileScreen() {
  return (
    <ClientLayout activeKey="profile">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ProfileView />
      </SafeAreaView>
    </ClientLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
