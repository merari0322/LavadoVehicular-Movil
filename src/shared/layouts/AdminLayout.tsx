import React from 'react';
import { RoleLayout, RoleMenu } from './RoleLayout';

// menú del administrador (mismo orden que el sidebar de la web)
const ADMIN_MENU: RoleMenu = {
  bar: [
    { key: 'dashboard', icon: 'dashboard', route: 'AdminDashboard' },
    { key: 'reservations', icon: 'event', route: 'AdminReservations' },
    { key: 'payments', icon: 'payments', route: 'AdminPayments' },
    { key: 'operators', icon: 'groups', route: 'AdminOperators' },
  ],
  action: { key: 'notifications', icon: 'notifications', route: 'AdminNotifications' },
  more: [
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
