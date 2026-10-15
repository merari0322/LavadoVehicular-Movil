import React from 'react';
import { RoleLayout, RoleMenu } from './RoleLayout';

// menú del operario: las mismas opciones del sidebar de la web, repartidas entre la barra
// inferior y el menú "más"
const OPERATOR_MENU: RoleMenu = {
  bar: [
    { key: 'dashboard', icon: 'dashboard', route: 'OperatorHome', labelKey: 'BOTTOM_NAV.HOME' },
    { key: 'schedule', icon: 'calendar-month', route: 'OperatorSchedule', labelKey: 'BOTTOM_NAV.SCHEDULE' },
    { key: 'assigned', icon: 'assignment', route: 'OperatorAssigned', labelKey: 'BOTTOM_NAV.ASSIGNED' },
  ],
  action: { key: 'notifications', icon: 'notifications', route: 'OperatorNotifications', labelKey: 'BOTTOM_NAV.NOTIFICATIONS' },
  more: [
    { key: 'history', icon: 'history', route: 'OperatorHistory', labelKey: 'SIDEBAR.HISTORY' },
    { key: 'profile', icon: 'person', route: 'OperatorProfile', labelKey: 'SIDEBAR.PROFILE' },
    { key: 'ratings', icon: 'star-outline', route: 'OperatorRatings', labelKey: 'SIDEBAR.RATINGS' },
    { key: 'settings', icon: 'settings', route: 'OperatorSettings', labelKey: 'SIDEBAR.CONFIG' },
  ],
};

interface OperatorLayoutProps {
  activeKey: string;
  children: React.ReactNode;
}

export function OperatorLayout({ activeKey, children }: OperatorLayoutProps) {
  return (
    <RoleLayout menu={OPERATOR_MENU} activeKey={activeKey}>
      {children}
    </RoleLayout>
  );
}
