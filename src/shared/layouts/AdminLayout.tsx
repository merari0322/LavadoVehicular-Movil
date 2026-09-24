import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTheme } from '../../app/theme';
import { AdminBottomNav, BottomNavItem } from '../components/AdminBottomNav';
import { MoreMenuModal, MoreMenuItem } from '../components/MoreMenuModal';

interface AdminLayoutProps {
  activeKey: string;
  children: React.ReactNode;
}

function notImplemented(label: string) {
  Alert.alert('Próximamente', `${label} está en construcción.`);
}

export function AdminLayout({ activeKey, children }: AdminLayoutProps) {
  const { colors } = useTheme();
  const [moreVisible, setMoreVisible] = useState(false);

  const navItems: BottomNavItem[] = [
    { key: 'dashboard', icon: 'dashboard', onPress: () => {} },
    { key: 'reservations', icon: 'event', onPress: () => notImplemented('Reservas') },
    { key: 'payments', icon: 'payments', onPress: () => notImplemented('Pagos') },
    { key: 'operators', icon: 'groups', onPress: () => notImplemented('Operarios') },
  ];

  const moreItems: MoreMenuItem[] = [
    { key: 'management', label: 'Gestión', icon: 'build', onPress: () => notImplemented('Gestión') },
    { key: 'schedule', label: 'Horarios y bahías', icon: 'schedule', onPress: () => notImplemented('Horarios y bahías') },
    { key: 'reports', label: 'Reportes', icon: 'bar_chart', onPress: () => notImplemented('Reportes') },
    { key: 'notifications', label: 'Notificaciones', icon: 'notifications', onPress: () => notImplemented('Notificaciones') },
    { key: 'profile', label: 'Perfil', icon: 'person', onPress: () => notImplemented('Perfil') },
    { key: 'settings', label: 'Configuración', icon: 'settings', onPress: () => notImplemented('Configuración') },
    { key: 'logout', label: 'Cerrar sesión', icon: 'logout', tone: 'danger', onPress: () => notImplemented('Cerrar sesión') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {children}
      <AdminBottomNav items={navItems} activeKey={activeKey} onOpenMore={() => setMoreVisible(true)} />
      <MoreMenuModal visible={moreVisible} onClose={() => setMoreVisible(false)} items={moreItems} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
