import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../app/theme';
import { RootStackParamList } from '../../core/navigation/types';
import { useSession } from '../../core/services/auth';
import { ConfirmDialog } from '../components/feedback/ConfirmDialog';
import { withAlpha } from '../utils/color';
import { AdminBottomNav, BottomNavItem } from './AdminBottomNav';
import { MoreMenuItem, MoreMenuPanel, MoreMenuUser } from './MoreMenuPanel';

type IconName = keyof typeof MaterialIcons.glyphMap;
export type ScreenName = keyof RootStackParamList;

// opción de la barra inferior o del menú "más": ícono y pantalla a la que lleva
export interface RoleNavOption {
  key: string;
  icon: IconName;
  route: ScreenName;
  // llave de traducción del nombre que se muestra bajo el ícono o en el menú "más"
  labelKey?: string;
}

// menú completo de un rol: 3 botones de la barra, el botón suelto (notificaciones)
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
  const [logoutVisible, setLogoutVisible] = useState(false);
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
    setLogoutVisible(true);
  };

  const logout = () => {
    setLogoutVisible(false);
    void signOut();
  };

  const toBarItem = (option: RoleNavOption): BottomNavItem => ({
    key: option.key,
    icon: option.icon,
    label: option.labelKey ? t(option.labelKey) : option.key,
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
        isMoreActive={menu.more.some((option) => option.key === activeKey)}
        moreLabel={t('BOTTOM_NAV.MORE')}
        onToggleMore={() => setMoreVisible((prev) => !prev)}
      />
      <ConfirmDialog
        visible={logoutVisible}
        icon="logout"
        confirmIcon="logout"
        title={t('LOGOUT.TITLE')}
        message={t('LOGOUT.MESSAGE')}
        confirmLabel={t('LOGOUT.CONFIRM')}
        cancelLabel={t('LOGOUT.CANCEL')}
        onConfirm={logout}
        onCancel={() => setLogoutVisible(false)}
      >
        {/* cuenta que se va a cerrar */}
        {user ? (
          <View style={[styles.account, { backgroundColor: withAlpha(colors.primary, 0.08), borderColor: withAlpha(colors.primary, 0.2) }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.onPrimary }]}>{menuUser.initials}</Text>
            </View>
            <View style={styles.accountText}>
              <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>
                {menuUser.name}
              </Text>
              <Text style={[styles.accountEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                {menuUser.email}
              </Text>
            </View>
          </View>
        ) : null}
      </ConfirmDialog>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  account: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
  accountText: { flex: 1 },
  accountName: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold },
  accountEmail: { marginTop: 2, fontSize: fontSize.small },
});
