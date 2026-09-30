import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OperatorLayout } from '../../../shared/layouts/OperatorLayout';
import { ProfileView } from '../../../shared/screens/ProfileView';

// perfil real del operario (mismo componente que cliente y administrador)
export function OperatorProfileScreen() {
  return (
    <OperatorLayout activeKey="profile">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ProfileView />
      </SafeAreaView>
    </OperatorLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
