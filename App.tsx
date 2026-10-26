import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/core/navigation';
import { navigationRef } from './src/core/navigation/navigationRef';

export default function App() {
  return (
    <AppProviders>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AppProviders>
  );
}
