import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/core/navigation';

export default function App() {
  return (
    <AppProviders>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AppProviders>
  );
}
