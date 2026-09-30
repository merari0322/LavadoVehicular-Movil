import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, radius, useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';
import { maskDate } from '../../utils/format';

interface SearchInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
}

// buscador con lupa y botón para borrar
export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.box, { borderColor: colors.border, backgroundColor: withAlpha(colors.textMuted, 0.1) }]}>
      <MaterialIcons name="search" size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text }]}
        autoCorrect={false}
      />
      {value ? (
        <Pressable onPress={() => onChange('')} hitSlop={8}>
          <MaterialIcons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

interface DateInputProps {
  // se guarda tal como se escribe: dd/mm/aaaa
  value: string;
  onChange: (text: string) => void;
  hasError?: boolean;
}

// fecha escrita con máscara dd/mm/aaaa (reemplaza al <input type="date"> de la web)
export function DateInput({ value, onChange, hasError = false }: DateInputProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.box,
        { borderColor: hasError ? colors.error : colors.border, backgroundColor: withAlpha(colors.textMuted, 0.1) },
      ]}
    >
      <MaterialIcons name="calendar-today" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={(text) => onChange(maskDate(text))}
        placeholder="dd/mm/aaaa"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={10}
        style={[styles.input, { color: colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  input: { flex: 1, height: 46, fontSize: fontSize.body },
});
