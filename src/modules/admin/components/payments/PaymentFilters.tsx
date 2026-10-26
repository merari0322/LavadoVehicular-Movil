import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SelectField, SelectOption } from '../../../../shared/components/forms/SelectField';
import { withAlpha } from '../../../../shared/utils/color';
import { PAYMENT_TEXTS } from '../../constants/paymentTexts';
import { PAYMENT_METHODS, PAYMENT_STATUSES, PaymentFilters as Filters } from '../../models/payment';

interface PaymentFiltersProps {
  filters: Filters;
  onChange: (partial: Partial<Filters>) => void;
  onClear: () => void;
}

// Opciones de los selectores de filtro
const METHOD_OPTIONS: SelectOption[] = [
  { value: '', label: PAYMENT_TEXTS.filters.allMethods },
  ...PAYMENT_METHODS.map((method) => ({
    value: method,
    label: PAYMENT_TEXTS.filters.method(PAYMENT_TEXTS.methods[method]),
  })),
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: PAYMENT_TEXTS.filters.allStatuses },
  ...PAYMENT_STATUSES.map((status) => ({ value: status, label: PAYMENT_TEXTS.status[status] })),
];

// Barra de búsqueda y filtros de la lista de pagos
export function PaymentFilters({ filters, onChange, onClear }: PaymentFiltersProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      {/* Buscador por cliente, documento o referencia */}
      <View style={styles.inputBox}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.input}
          value={filters.search}
          onChangeText={(text) => onChange({ search: text })}
          placeholder={PAYMENT_TEXTS.filters.search}
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
      </View>

      {/* Método y estado */}
      <View style={styles.selectRow}>
        <View style={styles.flex}>
          <SelectField
            value={filters.method}
            options={METHOD_OPTIONS}
            onChange={(value) => onChange({ method: value as Filters['method'] })}
          />
        </View>
        <View style={styles.flex}>
          <SelectField
            value={filters.status}
            options={STATUS_OPTIONS}
            onChange={(value) => onChange({ status: value as Filters['status'] })}
          />
        </View>
      </View>

      <Pressable style={styles.clearButton} onPress={onClear}>
        <Text style={styles.clearText}>{PAYMENT_TEXTS.filters.clear}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    card: {
      gap: 10,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    inputBox: {
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.06),
    },
    input: { flex: 1, fontSize: 14, color: colors.text },
    selectRow: { flexDirection: 'row', gap: 10 },
    clearButton: {
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearText: { fontSize: 14, fontWeight: '700', color: colors.text },
  });
