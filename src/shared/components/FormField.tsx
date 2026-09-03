import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { useTheme } from '../../app/theme';

interface FormFieldProps {
  label: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  rightAccessory?: React.ReactNode;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  maxLength?: number;
}

// campo base reutilizado por Login, Register y los pasos de recuperación de contraseña
export function FormField({
  label,
  icon,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  secureTextEntry,
  rightAccessory,
  keyboardType,
  autoCapitalize = 'none',
  maxLength,
}: FormFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.bgSoft,
            borderColor: error ? '#ef5350' : colors.border,
          },
        ]}
      >
        {icon && <MaterialIcons name={icon} size={18} color={colors.textMuted} style={styles.icon} />}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          style={[styles.input, { color: colors.text }]}
        />

        {rightAccessory}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    gap: 10,
  },
  icon: {
    marginTop: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  error: {
    marginTop: 6,
    color: '#ef5350',
    fontSize: 12,
  },
});
