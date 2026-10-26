import React from 'react';

import { OperatorLayout } from '../../../shared/layouts/OperatorLayout';
import { SettingsView } from '../../../shared/screens/SettingsView';

export function OperatorSettingsScreen() {
  return (
    <OperatorLayout activeKey="settings">
      <SettingsView />
    </OperatorLayout>
  );
}
