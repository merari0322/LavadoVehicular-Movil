import React from 'react';

import { OperatorLayout } from '../../../shared/layouts/OperatorLayout';
import { NotificationsView } from '../../../shared/screens/NotificationsView';

export function OperatorNotificationsScreen() {
  return (
    <OperatorLayout activeKey="notifications">
      <NotificationsView role="OPERATOR" />
    </OperatorLayout>
  );
}
