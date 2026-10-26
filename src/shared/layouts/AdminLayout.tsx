import React from 'react';
import { RoleLayout, RoleMenu } from './RoleLayout';

// menú del administrador (mismo orden que el sidebar de la web)
const ADMIN_MENU: RoleMenu = {
  bar: [
    { key: 'dashboard', icon: 'dashboard', route: 'AdminDashboard', labelKey: 'BOTTOM_NAV.HOME' },
    { key: 'reservations', icon: 'event', route: 'AdminReservations', labelKey: 'BOTTOM_NAV.BOOKINGS' },
    { key: 'payments', icon: 'payments', route: 'AdminPayments', labelKey: 'BOTTOM_NAV.PAYMENTS' },
  ],
  action: { key: 'notifications', icon: 'notifications', route: 'AdminNotifications', labelKey: 'BOTTOM_NAV.NOTIFICATIONS' },
  more: [
    { key: 'operators', icon: 'groups', route: 'AdminOperators', labelKey: 'SIDEBAR.OPERATORS' },
    { key: 'profile', icon: 'person', route: 'AdminProfile', labelKey: 'SIDEBAR.PROFILE' },
    { key: 'management', icon: 'admin-panel-settings', route: 'AdminManagement', labelKey: 'SIDEBAR.MANAGEMENT' },
    { key: 'schedule', icon: 'schedule', route: 'AdminSchedule', labelKey: 'SIDEBAR.SCHEDULE_BAYS' },
    { key: 'reports', icon: 'bar-chart', route: 'AdminReports', labelKey: 'SIDEBAR.REPORTS' },
    { key: 'settings', icon: 'settings', route: 'AdminSettings', labelKey: 'SIDEBAR.CONFIG' },
  ],
};

interface AdminLayoutProps {
  activeKey: string;
  children: React.ReactNode;
}

export function AdminLayout({ activeKey, children }: AdminLayoutProps) {
  return (
    <RoleLayout menu={ADMIN_MENU} activeKey={activeKey}>
      {children}
    </RoleLayout>
  );
}
