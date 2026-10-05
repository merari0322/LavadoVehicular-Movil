import React from 'react';

import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { NotificationsView } from '../../../shared/screens/NotificationsView';

export function ClientNotificationsScreen() {
  return (
    <ClientLayout activeKey="notifications">
      <NotificationsView role="CLIENT" />
    </ClientLayout>
  );
}
