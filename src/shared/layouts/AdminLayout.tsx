import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../app/theme';
import { RootStackParamList } from '../../core/navigation/types';
import { AdminBottomNav, BottomNavItem } from './AdminBottomNav';
import { MoreMenuItem, MoreMenuPanel, MoreMenuUser } from './MoreMenuPanel';

interface AdminLayoutProps {
  activeKey: string;
  children: React.ReactNode;
}

const ADMIN_USER: MoreMenuUser = {
  initials: 'JD',
  name: 'Juan Díaz',
  email: 'juan@email.com',
};

function notImplemented(label: string) {
  Alert.alert('Próximamente', `${label} está en construcción.`);
}

export function AdminLayout({ activeKey, children }: AdminLayoutProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [moreVisible, setMoreVisible] = useState(false);

  const navItems: BottomNavItem[] = [
    { key: 'dashboard', icon: 'dashboard', onPress: () => { setMoreVisible(false); navigation.navigate('AdminDashboard'); } },
    { key: 'reservations', icon: 'event', onPress: () => navigation.navigate('AdminReservations') },
    { key: 'payments', icon: 'payments', onPress: () => navigation.navigate('AdminPayments') },
    { key: 'operators', icon: 'groups', onPress: () => notImplemented('Operarios') },
  ];

  const actionItem: BottomNavItem = {
    key: 'notifications',
    icon: 'notifications',
    onPress: () => notImplemented('Notificaciones'),
  };

  const moreItems: MoreMenuItem[] = [
    { key: 'profile', label: 'Perfil', icon: 'person', onPress: () => navigation.navigate('AdminProfile') },
    { key: 'management', label: 'Gestión', icon: 'admin-panel-settings', onPress: () => navigation.navigate('AdminManagement') },
    { key: 'schedule', label: 'Horarios y bahías', icon: 'schedule', onPress: () => navigation.navigate('AdminSchedule') },
    { key: 'reports', label: 'Reportes', icon: 'bar-chart', onPress: () => notImplemented('Reportes') },
    { key: 'settings', label: 'Configuración', icon: 'settings', onPress: () => notImplemented('Configuración') },
    {
      key: 'logout',
      label: 'Cerrar sesión',
      icon: 'logout',
      tone: 'danger',
      onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {children}
      <MoreMenuPanel
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
        items={moreItems}
        user={ADMIN_USER}
      />
      <AdminBottomNav
        items={navItems}
        actionItem={actionItem}
        activeKey={activeKey}
        isMoreOpen={moreVisible}
        onToggleMore={() => setMoreVisible((prev) => !prev)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
