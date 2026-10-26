import React from 'react';
import { RoleLayout, RoleMenu } from './RoleLayout';

// menú del cliente: las mismas opciones del sidebar de la web, repartidas entre la barra
// inferior y el menú "más"
const CLIENT_MENU: RoleMenu = {
  bar: [
    { key: 'dashboard', icon: 'dashboard', route: 'ClientHome', labelKey: 'BOTTOM_NAV.HOME' },
    { key: 'reserve', icon: 'local-car-wash', route: 'ClientReserve', labelKey: 'BOTTOM_NAV.BOOK' },
    { key: 'history', icon: 'history', route: 'ClientHistory', labelKey: 'BOTTOM_NAV.HISTORY' },
  ],
  action: { key: 'notifications', icon: 'notifications', route: 'ClientNotifications', labelKey: 'BOTTOM_NAV.NOTIFICATIONS' },
  more: [
    { key: 'vehicles', icon: 'directions-car', route: 'ClientVehicles', labelKey: 'SIDEBAR.VEHICLES' },
    { key: 'profile', icon: 'person', route: 'ClientProfile', labelKey: 'SIDEBAR.PROFILE' },
    { key: 'payment', icon: 'credit-card', route: 'ClientPayment', labelKey: 'SIDEBAR.PAYMENT' },
    { key: 'settings', icon: 'settings', route: 'ClientSettings', labelKey: 'SIDEBAR.CONFIG' },
  ],
};

interface ClientLayoutProps {
  activeKey: string;
  children: React.ReactNode;
}

export function ClientLayout({ activeKey, children }: ClientLayoutProps) {
  return (
    <RoleLayout menu={CLIENT_MENU} activeKey={activeKey}>
      {children}
    </RoleLayout>
  );
}
