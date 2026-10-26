import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { OPERATOR_FILTERS, OperatorFilter } from '../../models/operator';

interface OperatorFiltersProps {
  search: string;
  onSearch: (text: string) => void;
  filter: OperatorFilter;
  onFilter: (filter: OperatorFilter) => void;
  counts: Record<OperatorFilter, number>;
}

// Buscador y chips de filtro con contador
export function OperatorFilters({ search, onSearch, filter, onFilter, counts }: OperatorFiltersProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={onSearch}
          placeholder={OPERATOR_TEXTS.search}
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {OPERATOR_FILTERS.map((item) => {
          const active = item === filter;
          return (
            <Pressable
              key={item}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onFilter(item)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {OPERATOR_TEXTS.filters[item]}
              </Text>
              <View style={[styles.count, active && styles.countActive]}>
                <Text style={[styles.countText, active && styles.chipTextActive]}>{counts[item]}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      gap: 12,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    searchBox: {
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
    searchInput: { flex: 1, fontSize: 14, color: colors.text },
    chips: { gap: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    chipActive: { borderColor: colors.primary, backgroundColor: withAlpha(colors.primary, 0.14) },
    chipText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    chipTextActive: { color: colors.primaryHover },
    count: {
      minWidth: 22,
      alignItems: 'center',
      paddingVertical: 1,
      paddingHorizontal: 6,
      borderRadius: 999,
      backgroundColor: withAlpha(colors.textMuted, 0.18),
    },
    countActive: { backgroundColor: withAlpha(colors.primary, 0.2) },
    countText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  });
