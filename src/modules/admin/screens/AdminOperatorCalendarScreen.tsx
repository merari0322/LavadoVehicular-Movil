import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { RootStackParamList } from '../../../core/navigation/types';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { withAlpha } from '../../../shared/utils/color';
import { DASHBOARD_TEXTS } from '../constants/dashboardTexts';
import { OPERATOR_TEXTS } from '../constants/operatorTexts';
import { SCHEDULE_TEXTS } from '../constants/scheduleTexts';
import { CalendarBlock, CalendarBlockType, CalendarView } from '../models/operator';
import { WEEK_DAYS } from '../models/schedule';
import { useOperators } from '../viewmodels/useOperators';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminOperatorCalendar'>;

// días de la grilla: lunes a sábado (igual que la web)
const DAY_INDEXES = [0, 1, 2, 3, 4, 5];
const VIEWS: CalendarView[] = ['week', 'day', 'month'];
const LEGEND: CalendarBlockType[] = ['available', 'service', 'leave', 'lunch'];

// lunes de la semana actual movido "offset" semanas
function mondayOf(offset: number): Date {
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  monday.setDate(monday.getDate() + offset * 7);
  return monday;
}

// número de semana ISO del lunes indicado
function isoWeek(monday: Date): number {
  const thursday = new Date(monday);
  thursday.setDate(thursday.getDate() + 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  return Math.ceil(((thursday.getTime() - firstThursday.getTime()) / 86400000 + 1) / 7);
}

// calendario de turnos de un operario (operator-calendar de la web): vista semana, día y mes.
// Solo muestra los bloques que llegan como datos; no calcula turnos.
export function AdminOperatorCalendarScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  useTranslation();
  const { operators, getCalendarBlocks } = useOperators();
  const texts = OPERATOR_TEXTS.calendar;
  const locale = DASHBOARD_TEXTS.dateLocale;

  const operator = operators.find((item) => item.id === route.params.operatorId);
  // turno semanal real del operario (operations-service)
  const blocks = getCalendarBlocks(route.params.operatorId);

  const [view, setView] = useState<CalendarView>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayIndex, setDayIndex] = useState(Math.min(5, (new Date().getDay() + 6) % 7));
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const monday = mondayOf(weekOffset);
  const dateOf = (index: number) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    return date;
  };
  const shortDate = (date: Date, withYear = false) =>
    date.toLocaleDateString(locale, withYear ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' });

  const dayName = (index: number) => SCHEDULE_TEXTS.days[WEEK_DAYS[index]];
  const blocksFor = (index: number) =>
    blocks.filter((block) => block.day === index).sort((a, b) => a.start.localeCompare(b.start));

  // jornada: primera hora de inicio y última de fin de su disponibilidad semanal
  const enabled = operator?.availability.filter((item) => item.enabled) ?? [];
  const fullDay =
    enabled.length > 0
      ? { from: enabled.map((item) => item.start).sort()[0], to: enabled.map((item) => item.end).sort().reverse()[0] }
      : { from: '--:--', to: '--:--' };

  const blockColor: Record<CalendarBlockType, string> = {
    available: colors.success,
    service: colors.primary,
    leave: colors.error,
    lunch: colors.warning,
  };

  const renderBlock = (block: CalendarBlock) => {
    const color = blockColor[block.type];
    return (
      <View
        key={`${block.day}-${block.start}`}
        style={[styles.block, { backgroundColor: withAlpha(color, 0.12), borderLeftColor: color }]}
      >
        <Text style={[styles.blockTime, { color }]}>
          {block.start} - {block.end}
        </Text>
        <Text style={styles.blockLabel}>{block.label}</Text>
        {block.bay ? <Text style={styles.blockBay}>{block.bay}</Text> : null}
      </View>
    );
  };

  const renderFree = () => (
    <View style={[styles.block, { backgroundColor: withAlpha(colors.success, 0.12), borderLeftColor: colors.success }]}>
      <Text style={styles.blockLabel}>{texts.free}</Text>
    </View>
  );

  // celdas del mes (lunes = primera columna); null = espacio antes del día 1
  const monthCells = useMemo(() => {
    const offset = (month.getDay() + 6) % 7;
    const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (number | null)[] = Array.from({ length: offset }, () => null);
    for (let day = 1; day <= total; day++) cells.push(day);
    return cells;
  }, [month]);

  const shiftMonth = (delta: number) => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  if (!operator) {
    return (
      <AdminLayout activeKey="operators">
        <SafeAreaView edges={['top']} style={styles.container}>
          <Pressable style={styles.back} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={styles.backText}>{OPERATOR_TEXTS.detail.back}</Text>
          </Pressable>
        </SafeAreaView>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeKey="operators">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable style={styles.back} onPress={() => navigation.goBack()} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={styles.backText}>{texts.back}</Text>
          </Pressable>

          <View>
            <Text style={styles.title}>{texts.title(operator.name)}</Text>
            <Text style={styles.subtitle}>{texts.subtitle}</Text>
          </View>

          {/* Vista: semana / día / mes */}
          <View style={styles.toggle}>
            {VIEWS.map((item) => {
              const active = item === view;
              return (
                <Pressable key={item} onPress={() => setView(item)} style={[styles.toggleBtn, active && styles.toggleActive]}>
                  <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{texts.views[item]}</Text>
                </Pressable>
              );
            })}
          </View>

          {view !== 'month' ? (
            <View style={styles.card}>
              <View style={styles.navRow}>
                <Pressable onPress={() => setWeekOffset((prev) => prev - 1)} hitSlop={8}>
                  <MaterialIcons name="chevron-left" size={26} color={colors.primary} />
                </Pressable>
                <Text style={styles.navLabel}>
                  {texts.weekLabel(isoWeek(monday), shortDate(monday), shortDate(dateOf(6), true))}
                </Text>
                <Pressable onPress={() => setWeekOffset((prev) => prev + 1)} hitSlop={8}>
                  <MaterialIcons name="chevron-right" size={26} color={colors.primary} />
                </Pressable>
              </View>
              <View style={styles.navFooter}>
                <Pressable onPress={() => setWeekOffset(0)} style={styles.todayBtn}>
                  <Text style={styles.todayText}>{texts.today}</Text>
                </Pressable>
                <View style={styles.fullDay}>
                  <MaterialIcons name="schedule" size={14} color={colors.primary} />
                  <Text style={styles.fullDayText}>{texts.fullDay(fullDay.from, fullDay.to)}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Leyenda */}
          <View style={styles.legend}>
            {LEGEND.map((type) => (
              <View key={type} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: blockColor[type] }]} />
                <Text style={styles.legendText}>{texts.legend[type]}</Text>
              </View>
            ))}
          </View>

          {view === 'week'
            ? DAY_INDEXES.map((index) => {
                const dayBlocks = blocksFor(index);
                return (
                  <View key={index} style={styles.card}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayName}>{dayName(index)}</Text>
                      <Text style={styles.dayDate}>{shortDate(dateOf(index))}</Text>
                    </View>
                    {dayBlocks.length > 0 ? dayBlocks.map(renderBlock) : renderFree()}
                  </View>
                );
              })
            : null}

          {view === 'day' ? (
            <View style={styles.card}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayChips}>
                {DAY_INDEXES.map((index) => {
                  const active = index === dayIndex;
                  return (
                    <Pressable key={index} onPress={() => setDayIndex(index)} style={[styles.dayChip, active && styles.dayChipActive]}>
                      <Text style={[styles.dayChipName, active && styles.dayChipTextActive]}>{dayName(index)}</Text>
                      <Text style={[styles.dayChipDate, active && styles.dayChipTextActive]}>{shortDate(dateOf(index))}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              {blocksFor(dayIndex).length > 0 ? (
                blocksFor(dayIndex).map(renderBlock)
              ) : (
                <View style={styles.dayEmpty}>
                  <MaterialIcons name="event-available" size={32} color={colors.success} />
                  <Text style={styles.legendText}>{texts.free}</Text>
                </View>
              )}
            </View>
          ) : null}

          {view === 'month' ? (
            <View style={styles.card}>
              <View style={styles.navRow}>
                <Pressable onPress={() => shiftMonth(-1)} hitSlop={8}>
                  <MaterialIcons name="chevron-left" size={26} color={colors.primary} />
                </Pressable>
                <Text style={[styles.navLabel, styles.capitalize]}>
                  {month.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
                </Text>
                <Pressable onPress={() => shiftMonth(1)} hitSlop={8}>
                  <MaterialIcons name="chevron-right" size={26} color={colors.primary} />
                </Pressable>
              </View>
              <Pressable
                onPress={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                style={[styles.todayBtn, styles.centered]}
              >
                <Text style={styles.todayText}>{texts.today}</Text>
              </Pressable>
              <View style={styles.monthGrid}>
                {WEEK_DAYS.map((day) => (
                  <Text key={day} style={[styles.monthCell, styles.monthWeekday]}>
                    {SCHEDULE_TEXTS.days[day].slice(0, 3)}
                  </Text>
                ))}
                {monthCells.map((day, index) => {
                  // columna 0..6 = lunes..domingo: los bloques son por día de la semana
                  const count = day === null ? 0 : blocksFor(index % 7).length;
                  return (
                    <View key={`cell-${index}`} style={styles.monthCell}>
                      {day !== null ? (
                        <>
                          <Text style={styles.monthDay}>{day}</Text>
                          {count > 0 ? <View style={[styles.monthDot, { backgroundColor: colors.primary }]} /> : <View style={styles.monthDotSpace} />}
                        </>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </AdminLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    // el espacio de abajo evita que la barra inferior flotante tape el contenido
    content: { gap: 16, padding: 16, paddingBottom: 130 },
    back: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    backText: { fontSize: 14, color: colors.textSecondary },
    title: { fontSize: 22, fontWeight: '800', color: colors.text },
    subtitle: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    toggle: { flexDirection: 'row', gap: 6, padding: 4, borderRadius: 14, backgroundColor: withAlpha(colors.textMuted, 0.12) },
    toggleBtn: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    toggleActive: { backgroundColor: colors.card },
    toggleText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    toggleTextActive: { color: colors.primary, fontWeight: '800' },
    card: { gap: 10, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    navLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' },
    capitalize: { textTransform: 'capitalize' },
    navFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
    todayBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.primary },
    centered: { alignSelf: 'center' },
    todayText: { fontSize: 12, fontWeight: '700', color: colors.primary },
    fullDay: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: withAlpha(colors.primary, 0.12) },
    fullDayText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: colors.textSecondary },
    dayHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
    dayName: { fontSize: 15, fontWeight: '800', color: colors.text },
    dayDate: { fontSize: 12, color: colors.textMuted },
    block: { gap: 2, padding: 10, borderRadius: 10, borderLeftWidth: 4 },
    blockTime: { fontSize: 12, fontWeight: '800' },
    blockLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
    blockBay: { fontSize: 11, color: colors.textSecondary },
    dayChips: { gap: 8 },
    dayChip: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
    dayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    dayChipName: { fontSize: 12, fontWeight: '700', color: colors.text },
    dayChipDate: { fontSize: 11, color: colors.textSecondary },
    dayChipTextActive: { color: colors.onPrimary },
    dayEmpty: { alignItems: 'center', gap: 6, paddingVertical: 20 },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    monthCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 6 },
    monthWeekday: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
    monthDay: { fontSize: 13, color: colors.text },
    monthDot: { width: 6, height: 6, borderRadius: 3, marginTop: 3 },
    monthDotSpace: { height: 9 },
  });
