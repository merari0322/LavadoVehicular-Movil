import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../app/theme';
import { PasswordStrength } from '../validators/authValidators';

interface PasswordRequirementsProps {
  strength: PasswordStrength;
  translationPrefix: string; // p.ej. 'REGISTER.REQUIREMENTS' o 'FORGOT.NEW_PASSWORD.REQUIREMENTS'
}

const RULES: Array<{ key: keyof PasswordStrength; labelKey: string }> = [
  { key: 'hasMinLength', labelKey: 'MIN' },
  { key: 'hasUppercase', labelKey: 'UPPERCASE' },
  { key: 'hasNumber', labelKey: 'NUMBER' },
  { key: 'hasSpecialChar', labelKey: 'SPECIAL' },
];

export function PasswordRequirements({ strength, translationPrefix }: PasswordRequirementsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {RULES.map((rule) => {
        const met = strength[rule.key];
        return (
          <View key={rule.key} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: met ? colors.primary : colors.border }]} />
            <Text style={[styles.label, { color: met ? colors.text : colors.textSecondary }]}>
              {t(`${translationPrefix}.${rule.labelKey}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
  },
});
