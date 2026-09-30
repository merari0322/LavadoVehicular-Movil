import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../app/theme';
import { RootStackParamList } from '../../core/navigation/types';
import { useSession } from '../../core/services/auth';
import { AdminBottomNav, BottomNavItem } from './AdminBottomNav';
import { MoreMenuItem, MoreMenuPanel, MoreMenuUser } from './MoreMenuPanel';

type IconName = keyof typeof MaterialIcons.glyphMap;
export type ScreenName = keyof RootStackParamList;

// opción de la barra inferior o del menú "más": ícono y pantalla a la que lleva
export interface RoleNavOption {
  key: string;
  icon: IconName;
  route: ScreenName;
  // llave de traducción del texto (solo se muestra en el menú "más")
  labelKey?: string;
}

// menú completo de un rol: 4 botones de la barra, el botón suelto (notificaciones)
// y las opciones del menú "más" (el botón de cerrar sesión se agrega solo)
export interface RoleMenu {
  bar: RoleNavOption[];
  action: RoleNavOption;
  more: RoleNavOption[];
}

interface RoleLayoutProps {
  menu: RoleMenu;
  activeKey: string;
  children: React.ReactNode;
}

// estructura común de las pantallas con sesión: contenido + barra inferior flotante +
// menú "más" con el usuario real. La usan administrador, cliente y operario.
export function RoleLayout({ menu, activeKey, children }: RoleLayoutProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [moreVisible, setMoreVisible] = useState(false);
  const { t } = useTranslation();
  const { user, signOut } = useSession();

  const menuUser: MoreMenuUser = {
    initials: user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '',
    name: user?.fullName ?? '',
    email: user?.email ?? '',
  };

  // todas las pantallas de la lista no reciben parámetros
  const goTo = (route: ScreenName) => {
    setMoreVisible(false);
    (navigation.navigate as (name: ScreenName) => void)(route);
  };

  // cierra la sesión en el servidor y en el celular; RootNavigator vuelve solo al login
  const confirmLogout = () => {
    setMoreVisible(false);
    Alert.alert(t('LOGOUT.TITLE'), t('LOGOUT.MESSAGE'), [
      { text: t('LOGOUT.CANCEL'), style: 'cancel' },
      { text: t('LOGOUT.CONFIRM'), style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  const toBarItem = (option: RoleNavOption): BottomNavItem => ({
    key: option.key,
    icon: option.icon,
    onPress: () => goTo(option.route),
  });

  const moreItems: MoreMenuItem[] = [
    ...menu.more.map((option) => ({
      key: option.key,
      label: option.labelKey ? t(option.labelKey) : option.key,
      icon: option.icon,
      onPress: () => goTo(option.route),
    })),
    { key: 'logout', label: t('SIDEBAR.LOGOUT'), icon: 'logout', tone: 'danger', onPress: confirmLogout },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {children}
      <MoreMenuPanel
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
        items={moreItems}
        user={menuUser}
      />
      <AdminBottomNav
        items={menu.bar.map(toBarItem)}
        actionItem={toBarItem(menu.action)}
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
