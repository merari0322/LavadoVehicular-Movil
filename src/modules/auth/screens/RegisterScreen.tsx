import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '../../../core/navigation/types';
import { AuthScreenLayout } from '../../../shared/components/AuthScreenLayout';
import { FormField } from '../../../shared/components/FormField';
import { PasswordField } from '../../../shared/components/PasswordField';
import { PasswordRequirements } from '../../../shared/components/PasswordRequirements';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { useTheme } from '../../../app/theme';
import { useRegisterViewModel } from '../viewmodels/useRegisterViewModel';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const vm = useRegisterViewModel();

  const handleSubmit = async () => {
    const success = await vm.submit();
    if (success) {
      navigation.replace('Login');
    }
  };

  return (
    <AuthScreenLayout>
      <Text style={[styles.title, { color: colors.text }]}>{t('REGISTER.TITLE')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('REGISTER.SUBTITLE')}</Text>

      <FormField
        label={t('REGISTER.FULL_NAME')}
        icon="person"
        value={vm.fullName}
        onChangeText={vm.setFullName}
        onBlur={() => vm.markTouched('fullName')}
        placeholder={t('REGISTER.FULL_NAME_PLACEHOLDER')}
        error={vm.fullNameError}
        autoCapitalize="words"
      />

      <FormField
        label={t('REGISTER.EMAIL')}
        icon="mail-outline"
        value={vm.email}
        onChangeText={vm.handleEmailChange}
        onBlur={() => vm.markTouched('email')}
        placeholder={t('REGISTER.EMAIL_PLACEHOLDER')}
        error={vm.emailError}
        keyboardType="email-address"
      />

      <FormField
        label={t('REGISTER.PHONE')}
        icon="call"
        value={vm.phone}
        onChangeText={vm.handlePhoneChange}
        onBlur={() => vm.markTouched('phone')}
        placeholder={t('REGISTER.PHONE_PLACEHOLDER')}
        error={vm.phoneError}
        keyboardType="number-pad"
        maxLength={10}
      />

      <PasswordField
        label={t('REGISTER.PASSWORD')}
        value={vm.password}
        onChangeText={vm.setPassword}
        onBlur={() => vm.markTouched('password')}
        placeholder={t('REGISTER.PASSWORD_PLACEHOLDER')}
        error={vm.passwordError}
      />
      <PasswordRequirements strength={vm.strength} translationPrefix="REGISTER.REQUIREMENTS" />

      <PasswordField
        label={t('REGISTER.CONFIRM_PASSWORD')}
        value={vm.confirmPassword}
        onChangeText={vm.setConfirmPassword}
        onBlur={() => vm.markTouched('confirmPassword')}
        placeholder={t('REGISTER.CONFIRM_PASSWORD_PLACEHOLDER')}
        error={vm.confirmPasswordError}
      />

      <PrimaryButton
        label={vm.submitting ? t('REGISTER.BUTTON_LOADING') : t('REGISTER.BUTTON')}
        onPress={handleSubmit}
        loading={vm.submitting}
      />

      <View style={styles.loginRow}>
        <Text style={[styles.loginText, { color: colors.textSecondary }]}>{t('REGISTER.ALREADY_ACCOUNT')} </Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.loginLink, { color: colors.primary }]}>{t('REGISTER.LOGIN')}</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 19,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
    flexWrap: 'wrap',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
