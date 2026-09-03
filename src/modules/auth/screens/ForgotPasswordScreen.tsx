import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

import { RootStackParamList } from '../../../core/navigation/types';
import { AuthScreenLayout } from '../../../shared/components/AuthScreenLayout';
import { Stepper } from '../../../shared/components/Stepper';
import { EmailStep } from '../components/EmailStep';
import { NewPasswordStep } from '../components/NewPasswordStep';
import { VerificationStep } from '../components/VerificationStep';
import { useForgotPasswordFlow } from '../viewmodels/useForgotPasswordFlow';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const flow = useForgotPasswordFlow();

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
        <VerificationStep email={flow.email} submitting={flow.submitting} onVerify={flow.handleCodeVerified} />
      )}

      {flow.step === 3 && <NewPasswordStep submitting={flow.submitting} onSubmit={handlePasswordUpdated} />}
    </AuthScreenLayout>
  );
}
