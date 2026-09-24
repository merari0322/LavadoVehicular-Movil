import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { ForgotPasswordScreen, LoginScreen, RegisterScreen } from '../../modules/auth';
import { ClientHomeScreen } from '../../modules/client/screens/ClientHomeScreen';
import { AdminDashboardScreen } from '../../modules/admin';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
}
