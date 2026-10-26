import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius, useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';

type IconName = keyof typeof MaterialIcons.glyphMap;

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
  // contador pequeño al lado del texto
  count?: number;
}

interface ChipTabsProps<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

// pestañas / filtros en forma de chips con desplazamiento horizontal
// (reemplaza a las pestañas y radio buttons de la web)
export function ChipTabs<T extends string>({ options, value, onChange }: ChipTabsProps<T>) {
  const { colors } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => {
        const active = option.value === value;
        const color = active ? colors.onPrimary : colors.textSecondary;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              active
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {option.icon ? <MaterialIcons name={option.icon} size={16} color={color} /> : null}
            <Text style={[styles.label, { color }]}>{option.label}</Text>
            {option.count !== undefined && option.count > 0 ? (
              <View
                style={[
                  styles.count,
                  { backgroundColor: active ? withAlpha('#ffffff', 0.3) : withAlpha(colors.primary, 0.15) },
                ]}
              >
                <Text style={[styles.countText, { color: active ? colors.onPrimary : colors.primary }]}>
                  {option.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: { fontSize: fontSize.small, fontWeight: fontWeight.semibold },
  count: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  countText: { fontSize: fontSize.tiny, fontWeight: fontWeight.bold },
});
