import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { ForgotPasswordScreen, LoginScreen, RegisterScreen } from '../../modules/auth';
import { ClientHomeScreen } from '../../modules/client/screens/ClientHomeScreen';
import { AdminDashboardScreen } from '../../modules/admin';
import { AdminOperatorsScreen } from '../../modules/admin/screens/AdminOperatorsScreen';
import { AdminScheduleScreen } from '../../modules/admin/screens/AdminScheduleScreen';
import { AdminReportsScreen } from '../../modules/admin/screens/AdminReportsScreen';
import { AdminManagementScreen } from '../../modules/admin/screens/AdminManagementScreen';
import { AdminPaymentsScreen } from '../../modules/admin/screens/AdminPaymentsScreen';
import { AdminProfileScreen } from '../../modules/admin/screens/AdminProfileScreen';
import { AdminReservationsScreen } from '../../modules/admin/screens/AdminReservationsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminOperators" component={AdminOperatorsScreen} />
      <Stack.Screen name="AdminSchedule" component={AdminScheduleScreen} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
      <Stack.Screen name="AdminManagement" component={AdminManagementScreen} />
      <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} />
      <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
      <Stack.Screen name="AdminReservations" component={AdminReservationsScreen} />
    </Stack.Navigator>
  );
}
