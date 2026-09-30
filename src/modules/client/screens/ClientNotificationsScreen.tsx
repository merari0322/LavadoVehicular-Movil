import React from 'react';

import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { NotificationsView } from '../../../shared/screens/NotificationsView';
import { CLIENT_NOTIFICATIONS } from '../services/clientMock';

export function ClientNotificationsScreen() {
  return (
    <ClientLayout activeKey="notifications">
      <NotificationsView role="CLIENT" initial={CLIENT_NOTIFICATIONS} />
    </ClientLayout>
  );
}
