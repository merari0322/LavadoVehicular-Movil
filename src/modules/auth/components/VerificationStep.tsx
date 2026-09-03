import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeSyntheticEvent, Pressable, StyleSheet, Text, TextInput, TextInputKeyPressEventData, View } from 'react-native';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { StepIcon } from '../../../shared/components/StepIcon';
import { useTheme } from '../../../app/theme';

const CODE_LENGTH = 6;

interface VerificationStepProps {
  email: string;
  submitting: boolean;
  onVerify: (code: string) => Promise<boolean>;
}

export function VerificationStep({ email, submitting, onVerify }: VerificationStepProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setError(null);

    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length !== CODE_LENGTH) return;

    const success = await onVerify(code);
    if (!success) {
      setError(t('FORGOT.VERIFICATION.INVALID_CODE'));
    }
  };

  return (
    <View style={styles.container}>
      <StepIcon />

      <Text style={[styles.title, { color: colors.text }]}>{t('FORGOT.VERIFICATION.TITLE')}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('FORGOT.VERIFICATION.DESCRIPTION')} <Text style={{ color: colors.primary, fontWeight: '700' }}>{email}</Text>
      </Text>

      <View style={styles.digitsRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(value) => handleChange(index, value)}
            onKeyPress={(event) => handleKeyPress(index, event)}
            keyboardType="number-pad"
            maxLength={1}
            style={[
              styles.digitInput,
              { borderColor: error ? '#ef5350' : colors.border, backgroundColor: colors.bgSoft, color: colors.text },
            ]}
          />
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.resendLink}>
        <Text style={[styles.resendText, { color: colors.primary }]}>{t('FORGOT.VERIFICATION.RESEND')}</Text>
      </Pressable>

      <PrimaryButton
        label={t('FORGOT.VERIFICATION.BUTTON')}
        onPress={handleVerify}
        disabled={digits.some((d) => !d)}
        loading={submitting}
      />

      <Pressable style={styles.backLink} onPress={() => navigation.navigate('Login' as never)}>
        <Text style={[styles.backLinkText, { color: colors.primary }]}>← {t('FORGOT.BACK_LOGIN')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  digitsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  digitInput: {
    width: 42,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  error: {
    marginTop: 10,
    color: '#ef5350',
    fontSize: 12,
    textAlign: 'center',
  },
  resendLink: {
    alignSelf: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  backLink: {
    alignSelf: 'center',
    marginTop: 18,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
