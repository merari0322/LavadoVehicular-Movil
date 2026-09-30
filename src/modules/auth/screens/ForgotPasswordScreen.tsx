import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { RootStackParamList } from '../../../core/navigation/types';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { Stepper } from '../../../shared/components/ui/Stepper';
import { EmailStep } from '../components/EmailStep';
import { NewPasswordStep } from '../components/NewPasswordStep';
import { VerificationStep } from '../components/VerificationStep';
import { useForgotPasswordFlow } from '../viewmodels/useForgotPasswordFlow';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const flow = useForgotPasswordFlow();

  // al terminar vuelve al login para entrar con la contraseña nueva
  const handlePasswordUpdated = async (newPassword: string) => {
    const success = await flow.handlePasswordUpdated(newPassword);
    if (success) {
      navigation.replace('Login');
    }
    return success;
  };

  return (
    <AuthScreenLayout>
      <Stepper currentStep={flow.step} />

      {flow.step === 1 && <EmailStep submitting={flow.submitting} onEmailSent={flow.handleEmailSent} />}

      {flow.step === 2 && (
        <VerificationStep
          email={flow.email}
          submitting={flow.submitting}
          onVerify={flow.handleCodeVerified}
          onResend={flow.handleResendCode}
          serverError={flow.errorMessage}
        />
      )}

      {flow.step === 3 && <NewPasswordStep submitting={flow.submitting} onSubmit={handlePasswordUpdated} />}

      {/* error del servidor en los pasos 1 y 3 (el paso 2 lo muestra dentro de sus casillas) */}
      {flow.errorMessage && flow.step !== 2 && <Text style={styles.error}>{flow.errorMessage}</Text>}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  error: {
    marginTop: 14,
    color: '#ef5350',
    fontSize: 13,
    textAlign: 'center',
  },
});
