import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PasswordField } from '../../../shared/components/PasswordField';
import { PasswordRequirements } from '../../../shared/components/PasswordRequirements';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { StepIcon } from '../../../shared/components/StepIcon';
import { useTheme } from '../../../app/theme';
import { getPasswordStrength, isPasswordStrong } from '../../../shared/validators/authValidators';

interface NewPasswordStepProps {
  submitting: boolean;
  onSubmit: (newPassword: string) => Promise<boolean>;
}

export function NewPasswordStep({ submitting, onSubmit }: NewPasswordStepProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === newPassword;
  const canSubmit = isPasswordStrong(strength) && passwordsMatch;

  return (
    <View style={styles.container}>
      <StepIcon />

      <Text style={[styles.title, { color: colors.text }]}>{t('FORGOT.NEW_PASSWORD.TITLE')}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{t('FORGOT.NEW_PASSWORD.DESCRIPTION')}</Text>

      <PasswordField
        label={t('FORGOT.NEW_PASSWORD.LABEL')}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder={t('FORGOT.NEW_PASSWORD.PLACEHOLDER')}
      />
      <PasswordRequirements strength={strength} translationPrefix="FORGOT.NEW_PASSWORD.REQUIREMENTS" />

      <PasswordField
        label={t('FORGOT.NEW_PASSWORD.CONFIRM')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        onBlur={() => setTouchedConfirm(true)}
        placeholder={t('FORGOT.NEW_PASSWORD.CONFIRM_PLACEHOLDER')}
        error={touchedConfirm && !passwordsMatch ? t('REGISTER.PASSWORDS_NOT_MATCH') : undefined}
      />

      <PrimaryButton
        label={t('FORGOT.NEW_PASSWORD.BUTTON')}
        onPress={() => onSubmit(newPassword)}
        disabled={!canSubmit}
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
    marginBottom: 4,
    lineHeight: 19,
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
