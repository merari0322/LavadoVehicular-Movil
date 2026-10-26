import React, { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SelectField, SelectOption } from '../../../../shared/components/forms/SelectField';
import { withAlpha } from '../../../../shared/utils/color';
import { SCHEDULE_TEXTS } from '../../constants/scheduleTexts';
import { BREAK_OPTIONS, DaySchedule } from '../../models/schedule';
import { Pill } from '../common/Pills';
import { TimeField } from '../common/TimeField';

interface DayScheduleRowProps {
  schedule: DaySchedule;
  error?: string;
  onChange: (partial: Partial<DaySchedule>) => void;
}

const texts = SCHEDULE_TEXTS.week;

// Opciones del selector de pausa
const BREAK_SELECT_OPTIONS: SelectOption[] = [
  { value: '', label: texts.noPause },
  ...BREAK_OPTIONS.map((option) => ({ value: option.id, label: `${option.start} - ${option.end}` })),
];

// Fila de un día: interruptor, horas de apertura/cierre, pausa y estado
export function DayScheduleRow({ schedule, error, onChange }: DayScheduleRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { day, open } = schedule;

  return (
    <View style={styles.container}>
      {/* Día, interruptor y estado */}
      <View style={styles.topRow}>
        <Switch
          value={open}
          onValueChange={(value) => onChange({ open: value })}
          trackColor={{ false: withAlpha(colors.textMuted, 0.35), true: colors.primaryHover }}
          thumbColor="#FFFFFF"
        />
        <View style={styles.flex}>
          <Text style={[styles.dayName, !open && styles.muted]}>{SCHEDULE_TEXTS.days[day]}</Text>
          <Text style={styles.dayType}>{open ? texts.working : texts.rest}</Text>
        </View>
        <Pill label={open ? texts.open : texts.closed} tone={open ? 'success' : 'error'} />
      </View>

      {/* Horas de apertura y cierre */}
      <View style={styles.timesRow}>
        <TimeField
          label={texts.opening}
          value={schedule.opening}
          onChange={(value) => onChange({ opening: value })}
          disabled={!open}
          hasError={Boolean(error)}
        />
        <Text style={styles.dash}>–</Text>
        <TimeField
          label={texts.closing}
          value={schedule.closing}
          onChange={(value) => onChange({ closing: value })}
          disabled={!open}
          hasError={Boolean(error)}
        />
      </View>

      {/* Pausa (solo si el día es laboral) */}
      <View>
        <Text style={styles.pauseLabel}>{texts.pause}</Text>
        {open ? (
          <SelectField
            value={schedule.breakId}
            options={BREAK_SELECT_OPTIONS}
            onChange={(value) => onChange({ breakId: value })}
            hasError={Boolean(error)}
          />
        ) : (
          <Text style={styles.notApplicable}>{texts.notApplicable}</Text>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: {
      gap: 10,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dayName: { fontSize: 16, fontWeight: '700', color: colors.text },
    dayType: { fontSize: 13, color: colors.textSecondary },
    muted: { color: colors.textSecondary },
    timesRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    dash: { paddingBottom: 10, fontSize: 16, color: colors.textSecondary },
    pauseLabel: { marginBottom: 4, fontSize: 12, color: colors.textSecondary },
    notApplicable: { fontSize: 14, color: colors.textSecondary },
    error: { fontSize: 12, fontWeight: '600', color: colors.error },
  });
