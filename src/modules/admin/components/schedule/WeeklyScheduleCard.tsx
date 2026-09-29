import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { SCHEDULE_TEXTS } from '../../constants/scheduleTexts';
import { DaySchedule, WeekDay } from '../../models/schedule';
import { WeekErrors } from '../../viewmodels/useSchedule';
import { DayScheduleRow } from './DayScheduleRow';

interface WeeklyScheduleCardProps {
  week: DaySchedule[];
  errors: WeekErrors;
  isDirty: boolean; // Hay cambios sin guardar
  onChangeDay: (day: WeekDay, partial: Partial<DaySchedule>) => void;
  onReset: () => void;
  onSave: () => void;
}

const texts = SCHEDULE_TEXTS.week;

// Tarjeta del horario semanal regular con sus botones de guardar y restablecer
export function WeeklyScheduleCard({ week, errors, isDirty, onChangeDay, onReset, onSave }: WeeklyScheduleCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{texts.title}</Text>
      <Text style={styles.description}>{texts.description}</Text>

      {/* Zona horaria */}
      <View style={styles.timezone}>
        <MaterialIcons name="public" size={14} color={colors.primaryHover} />
        <Text style={styles.timezoneText}>{texts.timezone}</Text>
      </View>

      {/* Un renglón por día */}
      {week.map((item) => (
        <DayScheduleRow
          key={item.day}
          schedule={item}
          error={errors[item.day]}
          onChange={(partial) => onChangeDay(item.day, partial)}
        />
      ))}

      {/* Pie: aviso y botones */}
      <View style={styles.infoRow}>
        <MaterialIcons name="info" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>{texts.info}</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, styles.resetButton, !isDirty && styles.disabled]}
          onPress={onReset}
          disabled={!isDirty}
        >
          <Text style={styles.resetText}>{texts.reset}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.saveButton, !isDirty && styles.disabled]}
          onPress={onSave}
          disabled={!isDirty}
        >
          <MaterialIcons name="check" size={18} color={colors.onPrimary} />
          <Text style={styles.saveText}>{texts.save}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    description: { marginTop: 4, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
    timezone: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      marginTop: 10,
      marginBottom: 4,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    timezoneText: { fontSize: 12, fontWeight: '700', color: colors.primaryHover },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
    infoText: { flexShrink: 1, fontSize: 13, color: colors.textSecondary },
    buttons: { flexDirection: 'row', gap: 10, marginTop: 14 },
    button: {
      flex: 1,
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 12,
    },
    resetButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    resetText: { fontSize: 14, fontWeight: '700', color: colors.text },
    saveButton: { backgroundColor: colors.primary },
    saveText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
    disabled: { opacity: 0.45 },
  });
