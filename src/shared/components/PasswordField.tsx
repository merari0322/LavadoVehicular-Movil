import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '../../app/theme';
import { FormField } from './FormField';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
}

// añade el toggle mostrar/ocultar sobre FormField, sin duplicar el input en cada pantalla
export function PasswordField({ label, value, onChangeText, onBlur, placeholder, error }: PasswordFieldProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      label={label}
      icon="lock-outline"
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholder={placeholder}
      error={error}
      secureTextEntry={!visible}
      rightAccessory={
        <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
          <MaterialIcons name={visible ? 'visibility-off' : 'visibility'} size={18} color={colors.textMuted} />
        </Pressable>
      }
    />
  );
}
