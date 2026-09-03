import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FormField } from '../../../shared/components/FormField';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { StepIcon } from '../../../shared/components/StepIcon';
import { useTheme } from '../../../app/theme';
import { isGmailEmail, isRequired, stripSpaces } from '../../../shared/validators/authValidators';

interface EmailStepProps {
  submitting: boolean;
  onEmailSent: (email: string) => void;
}

export function EmailStep({ submitting, onEmailSent }: EmailStepProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const error = touched && email.length > 0 && !isGmailEmail(email) ? t('FORGOT.EMAIL.INVALID') : undefined;
  const canSubmit = isRequired(email) && isGmailEmail(email);

  return (
    <View style={styles.container}>
      <StepIcon />

      <Text style={[styles.title, { color: colors.text }]}>{t('FORGOT.EMAIL.TITLE')}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{t('FORGOT.EMAIL.DESCRIPTION')}</Text>

      <FormField
        label={t('FORGOT.EMAIL.LABEL')}
        icon="mail-outline"
        value={email}
        onChangeText={(value) => setEmail(stripSpaces(value))}
        onBlur={() => setTouched(true)}
        placeholder={t('FORGOT.EMAIL.PLACEHOLDER')}
        error={error}
        keyboardType="email-address"
      />

      <PrimaryButton
        label={t('FORGOT.EMAIL.BUTTON')}
        onPress={() => onEmailSent(email)}
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
