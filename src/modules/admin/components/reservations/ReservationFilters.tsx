import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SelectField, SelectOption } from '../../../../shared/components/forms/SelectField';
import { withAlpha } from '../../../../shared/utils/color';
import { TEXTS } from '../../constants/reservationTexts';
import { RESERVATION_STATUSES, ReservationFilters as Filters } from '../../models/reservation';
import { OPERATORS } from '../../services/reservationMock';
import { getTodayISO, isoToDisplay, maskDate } from '../../utils/reservationUtils';

interface ReservationFiltersProps {
  filters: Filters;
  onChange: (partial: Partial<Filters>) => void;
  onClear: () => void;
}

// Opciones de los selectores de filtro
const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: TEXTS.filters.allStatuses },
  ...RESERVATION_STATUSES.map((status) => ({ value: status, label: TEXTS.status[status] })),
];

const OPERATOR_OPTIONS: SelectOption[] = [
  { value: '', label: TEXTS.filters.allOperators },
  { value: 'unassigned', label: TEXTS.filters.unassigned },
  ...OPERATORS.map((operator) => ({ value: operator.id, label: operator.name })),
];

// Barra de búsqueda y filtros de la lista de reservas
export function ReservationFilters({ filters, onChange, onClear }: ReservationFiltersProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      {/* Buscador por cliente, placa o código */}
      <View style={styles.inputBox}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.input}
          value={filters.search}
          onChangeText={(text) => onChange({ search: text })}
          placeholder={TEXTS.filters.search}
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
      </View>

      {/* Filtro por fecha con acceso rápido a "Hoy" */}
      <View style={styles.inputBox}>
        <MaterialIcons name="event" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.input}
          value={filters.date}
          onChangeText={(text) => onChange({ date: maskDate(text) })}
          placeholder={TEXTS.filters.datePlaceholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={10}
        />
        <Pressable
          style={styles.todayChip}
          onPress={() => onChange({ date: isoToDisplay(getTodayISO()) })}
        >
          <Text style={styles.todayText}>{TEXTS.filters.today}</Text>
        </Pressable>
      </View>

      {/* Estado y operario */}
      <View style={styles.selectRow}>
        <View style={styles.flex}>
          <SelectField
            value={filters.status}
            options={STATUS_OPTIONS}
            onChange={(value) => onChange({ status: value as Filters['status'] })}
          />
        </View>
        <View style={styles.flex}>
          <SelectField
            value={filters.operatorId}
            options={OPERATOR_OPTIONS}
            onChange={(value) => onChange({ operatorId: value })}
          />
        </View>
      </View>

      <Pressable style={styles.clearButton} onPress={onClear}>
        <Text style={styles.clearText}>{TEXTS.filters.clear}</Text>
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
    todayChip: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    todayText: { fontSize: 12, fontWeight: '700', color: colors.primary },
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
