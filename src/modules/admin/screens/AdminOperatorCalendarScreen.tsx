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
import { getTodayISO, toISODate } from '../utils/reservationUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminOperatorCalendar'>;

// la semana completa, de lunes a domingo (igual que la web)
const DAY_INDEXES = [0, 1, 2, 3, 4, 5, 6];
const VIEWS: CalendarView[] = ['week', 'day', 'month'];
// solo lo que el calendario realmente pinta
const LEGEND: CalendarBlockType[] = ['available', 'leave'];

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
  const firstOfYear = new Date(thursday.getFullYear(), 0, 1);
  return Math.ceil((Math.round((thursday.getTime() - firstOfYear.getTime()) / 86400000) + 1) / 7);
}

// calendario de turnos de un operario (operator-calendar de la web): vista semana, día y mes.
// Solo muestra los bloques que llegan como datos; no calcula turnos.
export function AdminOperatorCalendarScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  useTranslation();
  const { operators, getCalendarBlocks, getAbsenceOn } = useOperators();
  const texts = OPERATOR_TEXTS.calendar;
  const locale = DASHBOARD_TEXTS.dateLocale;

  const operator = operators.find((item) => item.id === route.params.operatorId);
  // turno semanal real del operario (operations-service)
  const blocks = getCalendarBlocks(route.params.operatorId);

  const [view, setView] = useState<CalendarView>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayIndex, setDayIndex] = useState((new Date().getDay() + 6) % 7);
  const todayISO = getTodayISO();
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
  // lo que tiene el operario en una fecha: su ausencia, o los turnos de ese día de la semana
  const blocksOn = (date: Date): CalendarBlock[] => {
    const weekday = (date.getDay() + 6) % 7;
    const absence = getAbsenceOn(route.params.operatorId, toISODate(date));
    if (absence) {
      return [{ day: weekday, start: '', end: '', type: 'leave', label: absence.reason || texts.legend.leave }];
    }
    return blocks.filter((block) => block.day === weekday).sort((a, b) => a.start.localeCompare(b.start));
  };
  const blocksFor = (index: number) => blocksOn(dateOf(index));
  const isPastDay = (index: number) => toISODate(dateOf(index)) < todayISO;
  const isTodayDay = (index: number) => toISODate(dateOf(index)) === todayISO;

  // "Hoy" vuelve a la semana, el día y el mes actuales
  const goToToday = () => {
    setWeekOffset(0);
    setDayIndex((new Date().getDay() + 6) % 7);
    setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  };

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
        {block.start ? (
          <Text style={[styles.blockTime, { color }]}>
            {block.start} - {block.end}
          </Text>
        ) : null}
        <Text style={styles.blockLabel}>{block.label}</Text>
        {block.bay ? <Text style={styles.blockBay}>{block.bay}</Text> : null}
      </View>
    );
  };

  const renderFree = () => (
    <View style={[styles.block, { backgroundColor: withAlpha(colors.textMuted, 0.08), borderLeftColor: colors.border }]}>
      <Text style={[styles.blockLabel, { color: colors.textMuted }]}>{texts.off}</Text>
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
                <Pressable onPress={goToToday} style={styles.todayBtn}>
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
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
              <Text style={styles.legendText}>{texts.off}</Text>
            </View>
          </View>

          {view === 'week'
            ? DAY_INDEXES.map((index) => {
                const dayBlocks = blocksFor(index);
                return (
                  <View key={index} style={[styles.card, isTodayDay(index) && styles.cardToday, isPastDay(index) && styles.past]}>
                    <View style={styles.dayHeader}>
                      <Text style={[styles.dayName, isTodayDay(index) && styles.todayColor]}>{dayName(index)}</Text>
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
                    <Pressable
                      key={index}
                      onPress={() => setDayIndex(index)}
                      style={[styles.dayChip, !active && isTodayDay(index) && styles.dayChipToday, !active && isPastDay(index) && styles.past, active && styles.dayChipActive]}
                    >
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
                  <MaterialIcons name="event-busy" size={32} color={colors.textMuted} />
                  <Text style={styles.legendText}>{texts.off}</Text>
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
              <Pressable onPress={goToToday} style={[styles.todayBtn, styles.centered]}>
                <Text style={styles.todayText}>{texts.today}</Text>
              </Pressable>
              <View style={styles.monthGrid}>
                {WEEK_DAYS.map((day) => (
                  <Text key={day} style={[styles.monthCell, styles.monthWeekday]}>
                    {SCHEDULE_TEXTS.days[day].slice(0, 3)}
                  </Text>
                ))}
                {monthCells.map((day, index) => {
                  // cada celda es una fecha real: ausencia (rojo), turno (verde) o no trabaja (gris)
                  const date = day === null ? null : new Date(month.getFullYear(), month.getMonth(), day);
                  const iso = date ? toISODate(date) : '';
                  const dayBlocks = date ? blocksOn(date) : [];
                  const dotColor = dayBlocks.length === 0 ? colors.border : blockColor[dayBlocks[0].type];
                  return (
                    <View key={`cell-${index}`} style={[styles.monthCell, iso !== '' && iso < todayISO && styles.past]}>
                      {day !== null ? (
                        <>
                          <Text style={[styles.monthDay, iso === todayISO && styles.monthToday]}>{day}</Text>
                          <View style={[styles.monthDot, { backgroundColor: dotColor }]} />
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
    // hoy resaltado; los días que ya pasaron, atenuados (solo consulta)
    cardToday: { borderColor: colors.primary, borderWidth: 2 },
    todayColor: { color: colors.primary },
    past: { opacity: 0.5 },
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
    dayChipToday: { borderColor: colors.primary },
    dayChipName: { fontSize: 12, fontWeight: '700', color: colors.text },
    dayChipDate: { fontSize: 11, color: colors.textSecondary },
    dayChipTextActive: { color: colors.onPrimary },
    dayEmpty: { alignItems: 'center', gap: 6, paddingVertical: 20 },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    monthCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 6 },
    monthWeekday: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
    monthDay: { fontSize: 13, color: colors.text },
    monthToday: {
      color: colors.onPrimary,
      backgroundColor: colors.primary,
      fontWeight: '800',
      minWidth: 26,
      textAlign: 'center',
      borderRadius: 13,
      overflow: 'hidden',
    },
    monthDot: { width: 6, height: 6, borderRadius: 3, marginTop: 3 },
  });
