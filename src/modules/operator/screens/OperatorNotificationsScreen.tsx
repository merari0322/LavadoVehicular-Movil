import React from 'react';

import { OperatorLayout } from '../../../shared/layouts/OperatorLayout';
import { NotificationsView } from '../../../shared/screens/NotificationsView';
import { OPERATOR_NOTIFICATIONS } from '../services/operatorMock';

export function OperatorNotificationsScreen() {
  return (
    <OperatorLayout activeKey="notifications">
      <NotificationsView role="OPERATOR" initial={OPERATOR_NOTIFICATIONS} />
    </OperatorLayout>
  );
}
