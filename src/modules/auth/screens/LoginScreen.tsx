import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '../../../core/navigation/types';
import { AuthScreenLayout } from '../../../shared/components/AuthScreenLayout';
import { FormField } from '../../../shared/components/FormField';
import { PasswordField } from '../../../shared/components/PasswordField';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { useTheme } from '../../../app/theme';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const vm = useLoginViewModel();

  const handleSubmit = async () => {
    const result = await vm.submit();
    if (result.success) {
      navigation.replace('ClientHome', { userName: result.userName ?? '' });
    }
  };

  return (
    <AuthScreenLayout>
      <Text style={[styles.title, { color: colors.text }]}>{t('LOGIN.TITLE')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('LOGIN.SUBTITLE')}</Text>

      <FormField
        label={t('LOGIN.EMAIL')}
        value={vm.email}
        onChangeText={vm.handleEmailChange}
        onBlur={() => vm.markTouched('email')}
        placeholder={t('LOGIN.EMAIL_PLACEHOLDER')}
        error={vm.emailError}
        keyboardType="email-address"
      />

      <PasswordField
        label={t('LOGIN.PASSWORD')}
        value={vm.password}
        onChangeText={vm.setPassword}
        onBlur={() => vm.markTouched('password')}
        placeholder={t('LOGIN.PASSWORD_PLACEHOLDER')}
        error={vm.passwordError}
      />

      {vm.formError && <Text style={styles.formError}>{vm.formError}</Text>}

      <Pressable style={styles.forgotLink} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={[styles.forgotLinkText, { color: colors.primary }]}>{t('LOGIN.FORGOT_PASSWORD')}</Text>
      </Pressable>

      <PrimaryButton label={t('LOGIN.BUTTON')} onPress={handleSubmit} loading={vm.submitting} />

      <View style={styles.registerRow}>
        <Text style={[styles.registerText, { color: colors.textSecondary }]}>{t('LOGIN.NO_ACCOUNT')} </Text>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.registerLink, { color: colors.primary }]}>{t('LOGIN.REGISTER')}</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
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
  formError: {
    marginTop: 14,
    color: '#ef5350',
    fontSize: 13,
    textAlign: 'center',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: 14,
  },
  forgotLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
    flexWrap: 'wrap',
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
