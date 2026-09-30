import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, useTheme } from '../../../app/theme';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { withAlpha } from '../../../shared/utils/color';
import { toISODate, todayISO } from '../../../shared/utils/format';

interface MiniCalendarProps {
  selectedDate: string; // aaaa-mm-dd
  // cantidad de servicios por día (se marca con un punto)
  servicesByDate: Record<string, number>;
  onSelect: (date: string) => void;
}

// calendario del mes para elegir el día de la agenda (mini-calendar de la web)
export function MiniCalendar({ selectedDate, servicesByDate, onSelect }: MiniCalendarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [year, month] = selectedDate.split('-').map(Number);
  const [view, setView] = useState({ year, month: month - 1 });

  const months = t('CALENDAR.MONTHS', { returnObjects: true }) as string[];
  const days = t('CALENDAR.DAYS_SHORT', { returnObjects: true }) as string[];
  const today = todayISO();

  // celdas del mes empezando en lunes (null = espacio vacío antes del día 1)
  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const offset = (first.getDay() + 6) % 7;
    const total = new Date(view.year, view.month + 1, 0).getDate();
    const list: (string | null)[] = Array.from({ length: offset }, () => null);
    for (let day = 1; day <= total; day++) list.push(toISODate(new Date(view.year, view.month, day)));
    return list;
  }, [view]);

  const move = (delta: number) =>
    setView((prev) => {
      const date = new Date(prev.year, prev.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });

  return (
    <SectionCard>
      <View style={styles.header}>
        <Pressable onPress={() => move(-1)} hitSlop={8}>
          <MaterialIcons name="chevron-left" size={26} color={colors.primary} />
        </Pressable>
        <Text style={[styles.month, { color: colors.text }]}>
          {Array.isArray(months) ? months[view.month] : ''} {view.year}
        </Text>
        <Pressable onPress={() => move(1)} hitSlop={8}>
          <MaterialIcons name="chevron-right" size={26} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {(Array.isArray(days) ? days : []).map((day) => (
          <Text key={day} style={[styles.cell, styles.dayName, { color: colors.textMuted }]}>
            {day}
          </Text>
        ))}
        {cells.map((iso, index) => {
          if (!iso) return <View key={`empty-${index}`} style={styles.cell} />;
          const selected = iso === selectedDate;
          const isToday = iso === today;
          const count = servicesByDate[iso] ?? 0;
          return (
            <Pressable key={iso} onPress={() => onSelect(iso)} style={styles.cell}>
              <View
                style={[
                  styles.day,
                  selected && { backgroundColor: colors.primary },
                  !selected && isToday && { borderWidth: 1.5, borderColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: selected ? colors.onPrimary : colors.text },
                    (selected || isToday) && { fontWeight: fontWeight.bold },
                  ]}
                >
                  {Number(iso.slice(8))}
                </Text>
              </View>
              {count > 0 ? (
                <View style={[styles.dot, { backgroundColor: selected ? colors.primary : withAlpha(colors.primary, 0.7) }]} />
              ) : (
                <View style={styles.dotSpace} />
              )}
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t('SCHEDULE.CALENDAR.SERVICES_OF_DAY')}</Text>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { fontSize: fontSize.cardTitle, fontWeight: fontWeight.bold },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
  dayName: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, textAlign: 'center', paddingBottom: 6 },
  day: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: fontSize.small },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  dotSpace: { height: 7 },
  hint: { fontSize: fontSize.caption, textAlign: 'center' },
});
