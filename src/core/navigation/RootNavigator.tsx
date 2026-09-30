import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '../../app/theme';
import { UserRole, useSession } from '../services/auth';
import { ForgotPasswordScreen, LoginScreen, RegisterScreen } from '../../modules/auth';
import { ClientHistoryScreen } from '../../modules/client/screens/ClientHistoryScreen';
import { ClientHomeScreen } from '../../modules/client/screens/ClientHomeScreen';
import { ClientNotificationsScreen } from '../../modules/client/screens/ClientNotificationsScreen';
import { ClientPaymentScreen } from '../../modules/client/screens/ClientPaymentScreen';
import { ClientProfileScreen } from '../../modules/client/screens/ClientProfileScreen';
import { ClientReserveScreen } from '../../modules/client/screens/ClientReserveScreen';
import { ClientSettingsScreen } from '../../modules/client/screens/ClientSettingsScreen';
import { ClientVehiclesScreen } from '../../modules/client/screens/ClientVehiclesScreen';
import { OperatorAssignedScreen } from '../../modules/operator/screens/OperatorAssignedScreen';
import { OperatorHistoryScreen } from '../../modules/operator/screens/OperatorHistoryScreen';
import { OperatorHomeScreen } from '../../modules/operator/screens/OperatorHomeScreen';
import { OperatorNotificationsScreen } from '../../modules/operator/screens/OperatorNotificationsScreen';
import { OperatorProfileScreen } from '../../modules/operator/screens/OperatorProfileScreen';
import { OperatorRatingsScreen } from '../../modules/operator/screens/OperatorRatingsScreen';
import { OperatorScheduleScreen } from '../../modules/operator/screens/OperatorScheduleScreen';
import { OperatorSettingsScreen } from '../../modules/operator/screens/OperatorSettingsScreen';
import { AdminDashboardScreen } from '../../modules/admin';
import { AdminOperatorsScreen } from '../../modules/admin/screens/AdminOperatorsScreen';
import { AdminOperatorCalendarScreen } from '../../modules/admin/screens/AdminOperatorCalendarScreen';
import { AdminScheduleScreen } from '../../modules/admin/screens/AdminScheduleScreen';
import { AdminReportsScreen } from '../../modules/admin/screens/AdminReportsScreen';
import { AdminNotificationsScreen } from '../../modules/admin/screens/AdminNotificationsScreen';
import { AdminSettingsScreen } from '../../modules/admin/screens/AdminSettingsScreen';
import { AdminManagementScreen } from '../../modules/admin/screens/AdminManagementScreen';
import { AdminPaymentsScreen } from '../../modules/admin/screens/AdminPaymentsScreen';
import { AdminProfileScreen } from '../../modules/admin/screens/AdminProfileScreen';
import { AdminReservationsScreen } from '../../modules/admin/screens/AdminReservationsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// si tiene varios roles, entra al de más privilegios
function mainRole(roles: UserRole[]): UserRole {
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('OPERATOR')) return 'OPERATOR';
  return 'CLIENT';
}

// cada rol solo tiene registradas sus pantallas: así no puede navegar al área de otro.
// Al iniciar o cerrar sesión cambia el grupo de pantallas solo (no hace falta navegar a mano).
export function RootNavigator() {
  const { status, user } = useSession();
  const { colors } = useTheme();

  if (status === 'loading') {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const role = user ? mainRole(user.roles) : null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!role && (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}

      {role === 'CLIENT' && (
        <>
          <Stack.Screen name="ClientHome" component={ClientHomeScreen} />
          <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
          <Stack.Screen name="ClientVehicles" component={ClientVehiclesScreen} />
          <Stack.Screen name="ClientReserve" component={ClientReserveScreen} />
          <Stack.Screen name="ClientPayment" component={ClientPaymentScreen} />
          <Stack.Screen name="ClientHistory" component={ClientHistoryScreen} />
          <Stack.Screen name="ClientNotifications" component={ClientNotificationsScreen} />
          <Stack.Screen name="ClientSettings" component={ClientSettingsScreen} />
        </>
      )}

      {role === 'OPERATOR' && (
        <>
          <Stack.Screen name="OperatorHome" component={OperatorHomeScreen} />
          <Stack.Screen name="OperatorProfile" component={OperatorProfileScreen} />
          <Stack.Screen name="OperatorSchedule" component={OperatorScheduleScreen} />
          <Stack.Screen name="OperatorAssigned" component={OperatorAssignedScreen} />
          <Stack.Screen name="OperatorHistory" component={OperatorHistoryScreen} />
          <Stack.Screen name="OperatorRatings" component={OperatorRatingsScreen} />
          <Stack.Screen name="OperatorNotifications" component={OperatorNotificationsScreen} />
          <Stack.Screen name="OperatorSettings" component={OperatorSettingsScreen} />
        </>
      )}

      {role === 'ADMIN' && (
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="AdminOperators" component={AdminOperatorsScreen} />
          <Stack.Screen name="AdminOperatorCalendar" component={AdminOperatorCalendarScreen} />
          <Stack.Screen name="AdminSchedule" component={AdminScheduleScreen} />
          <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
          <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
          <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
          <Stack.Screen name="AdminManagement" component={AdminManagementScreen} />
          <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} />
          <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
          <Stack.Screen name="AdminReservations" component={AdminReservationsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
