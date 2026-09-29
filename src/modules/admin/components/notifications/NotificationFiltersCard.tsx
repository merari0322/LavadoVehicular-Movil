import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { LabeledSelect } from '../../../../shared/components/forms/LabeledSelect';
import { SelectOption } from '../../../../shared/components/forms/SelectField';
import { NOTIFICATION_TEXTS } from '../../constants/notificationTexts';
import { NotificationFilters, READ_FILTERS, ReadFilter } from '../../models/notifications';
import { maskDate } from '../../utils/reservationUtils';
import { FilterErrors } from '../../viewmodels/useNotifications';

interface NotificationFiltersCardProps {
  filters: NotificationFilters;
  errors: FilterErrors;
  hasActiveFilters: boolean;
  onChange: (partial: Partial<NotificationFilters>) => void;
  onReset: () => void;
}

const texts = NOTIFICATION_TEXTS.filters;

// Opciones del selector de estado de lectura
const READ_OPTIONS: SelectOption[] = READ_FILTERS.map((value) => ({
  value,
  label: texts.readOptions[value],
}));

// Tarjeta de filtros: estado de lectura y rango de fechas
export function NotificationFiltersCard({
  filters,
  errors,
  hasActiveFilters,
  onChange,
  onReset,
}: NotificationFiltersCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{texts.title}</Text>
        <Pressable
          style={[styles.resetButton, !hasActiveFilters && styles.disabled]}
          onPress={onReset}
          disabled={!hasActiveFilters}
          accessibilityLabel={texts.reset}
          hitSlop={4}
        >
          <MaterialIcons name="refresh" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <LabeledSelect
        label={texts.readState}
        value={filters.readState}
        options={READ_OPTIONS}
        onChange={(value) => onChange({ readState: value as ReadFilter })}
      />

      {/* Rango de fechas */}
      <View>
        <Text style={styles.groupLabel}>{texts.dateGroup}</Text>
        <View style={styles.datesRow}>
          <LabeledInput
            containerStyle={styles.flex}
            label={texts.from}
            value={filters.dateFrom}
            onChangeText={(text) => onChange({ dateFrom: maskDate(text) })}
            placeholder={texts.datePlaceholder}
            error={errors.dateFrom}
            keyboardType="number-pad"
            maxLength={10}
          />
          <LabeledInput
            containerStyle={styles.flex}
            label={texts.to}
            value={filters.dateTo}
            onChangeText={(text) => onChange({ dateTo: maskDate(text) })}
            placeholder={texts.datePlaceholder}
            error={errors.dateTo}
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    card: {
      gap: 14,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    resetButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    disabled: { opacity: 0.45 },
    groupLabel: { marginBottom: 8, fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    datesRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  });
