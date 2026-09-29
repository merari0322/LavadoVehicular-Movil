import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/theme';
import { ThemeColors } from '../../app/theme/colors';
import { withAlpha } from '../utils/color';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

// Selector desplegable: en móvil abre una lista en un modal (reemplaza al <select> de la web)
export function SelectField({ value, options, onChange, placeholder = '', hasError = false }: SelectFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <>
      {/* Campo que se ve como un input */}
      <Pressable
        style={[styles.trigger, hasError && styles.triggerError]}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <MaterialIcons name="expand-more" size={20} color={colors.textSecondary} />
      </Pressable>

      {/* Lista de opciones */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <ScrollView>
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {option.label}
                    </Text>
                    {active && <MaterialIcons name="check" size={20} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    trigger: {
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.1),
    },
    triggerError: { borderColor: colors.error },
    triggerText: { flex: 1, fontSize: 14, color: colors.text },
    placeholder: { color: colors.textMuted },
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: 28,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    sheet: {
      maxHeight: '70%',
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 12,
    },
    optionActive: { backgroundColor: withAlpha(colors.primary, 0.12) },
    optionText: { fontSize: 15, color: colors.text },
    optionTextActive: { fontWeight: '700', color: colors.primary },
  });
