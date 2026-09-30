import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '../../../core/navigation/types';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { FormField } from '../../../shared/components/forms/FormField';
import { PasswordField } from '../../../shared/components/forms/PasswordField';
import { PasswordRequirements } from '../../../shared/components/forms/PasswordRequirements';
import { PrimaryButton } from '../../../shared/components/ui/PrimaryButton';
import { useTheme } from '../../../app/theme';
import { useRegisterViewModel } from '../viewmodels/useRegisterViewModel';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const vm = useRegisterViewModel();

  // la cuenta se crea en el backend; al aceptar el aviso vuelve al login
  const handleSubmit = async () => {
    const success = await vm.submit();
    if (success) {
      Alert.alert(t('REGISTER.SUCCESS_TITLE'), t('REGISTER.SUCCESS_MESSAGE'), [
        { text: t('REGISTER.SUCCESS_BUTTON'), onPress: () => navigation.replace('Login') },
      ]);
    }
  };

  return (
    <AuthScreenLayout>
      <Text style={[styles.title, { color: colors.text }]}>{t('REGISTER.TITLE')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('REGISTER.SUBTITLE')}</Text>

      {/* cédula: la tabla security.person la exige y no se puede repetir */}
      <FormField
        label={t('REGISTER.DOCUMENT')}
        icon="badge"
        value={vm.documentNumber}
        onChangeText={vm.handleDocumentChange}
        onBlur={() => vm.markTouched('documentNumber')}
        placeholder={t('REGISTER.DOCUMENT_PLACEHOLDER')}
        error={vm.documentError}
        keyboardType="number-pad"
        maxLength={20}
      />

      <FormField
        label={t('REGISTER.FIRST_NAMES')}
        icon="person"
        value={vm.firstName}
        onChangeText={vm.setFirstName}
        onBlur={() => vm.markTouched('firstName')}
        placeholder={t('REGISTER.FIRST_NAMES_PLACEHOLDER')}
        error={vm.firstNameError}
        autoCapitalize="words"
      />

      <FormField
        label={t('REGISTER.LAST_NAMES')}
        icon="person"
        value={vm.lastName}
        onChangeText={vm.setLastName}
        onBlur={() => vm.markTouched('lastName')}
        placeholder={t('REGISTER.LAST_NAMES_PLACEHOLDER')}
        error={vm.lastNameError}
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

      {/* error devuelto por el servidor (correo o cédula ya registrados, sin conexión...) */}
      {vm.formError && <Text style={styles.formError}>{vm.formError}</Text>}

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
  formError: {
    marginTop: 14,
    color: '#ef5350',
    fontSize: 13,
    textAlign: 'center',
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
