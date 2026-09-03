import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

import { RootStackParamList } from '../../../core/navigation/types';
import { LandingScreen } from './LandingScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

// conecta la pantalla presentacional con la navegación; LandingScreen no conoce
// react-navigation, solo recibe callbacks (mismo principio aplicado en toda la app)
export function LandingRoute({ navigation }: Props) {
  return (
    <LandingScreen
      onLoginPress={() => navigation.navigate('Login')}
      onRegisterPress={() => navigation.navigate('Register')}
    />
  );
}
