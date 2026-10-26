import React from 'react';

import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { SettingsView } from '../../../shared/screens/SettingsView';

export function ClientSettingsScreen() {
  return (
    <ClientLayout activeKey="settings">
      <SettingsView />
    </ClientLayout>
  );
}
