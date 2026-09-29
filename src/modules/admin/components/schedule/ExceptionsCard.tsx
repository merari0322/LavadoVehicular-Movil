import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { SCHEDULE_TEXTS } from '../../constants/scheduleTexts';
import { ExceptionType, ScheduleException } from '../../models/schedule';
import { isoToDisplay } from '../../utils/reservationUtils';
import { IconButton, Pill, PillTone } from './SchedulePills';

interface ExceptionsCardProps {
  exceptions: ScheduleException[];
  onAdd: () => void;
  onEdit: (exception: ScheduleException) => void;
  onDelete: (exception: ScheduleException) => void;
}

const texts = SCHEDULE_TEXTS.exceptions;

// Color de la etiqueta según el tipo de excepción
const TYPE_TONE: Record<ExceptionType, PillTone> = {
  holiday: 'error',
  special: 'warning',
  maintenance: 'neutral',
};

// Tarjeta con la lista de excepciones y días especiales
export function ExceptionsCard({ exceptions, onAdd, onEdit, onDelete }: ExceptionsCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{texts.title}</Text>
        <Pill label={texts.count(exceptions.length)} tone="primary" />
      </View>
      <Text style={styles.description}>{texts.subtitle}</Text>

      <Pressable style={styles.addButton} onPress={onAdd}>
        <MaterialIcons name="add" size={20} color={colors.onPrimary} />
        <Text style={styles.addText}>{texts.add}</Text>
      </Pressable>

      {exceptions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{texts.empty}</Text>
          <Text style={styles.description}>{texts.emptyHint}</Text>
        </View>
      ) : (
        exceptions.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemTop}>
              <Text style={styles.date}>{isoToDisplay(item.date)}</Text>
              <Pill label={texts.types[item.type]} tone={TYPE_TONE[item.type]} />
            </View>

            {/* Horario aplicable */}
            {item.closedAllDay ? (
              <Pill label={texts.closedAllDay} tone="error" />
            ) : (
              <Text style={styles.range}>
                {item.opening} - {item.closing}
              </Text>
            )}

            <Text style={styles.reason}>{item.description}</Text>

            <View style={styles.actions}>
              <IconButton icon="edit" onPress={() => onEdit(item)} />
              <IconButton icon="delete" danger onPress={() => onDelete(item)} />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      gap: 8,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    description: { fontSize: 13, lineHeight: 19, color: colors.textSecondary },
    addButton: {
      height: 46,
      marginVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    addText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
    empty: { alignItems: 'center', gap: 4, paddingVertical: 20 },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
    item: {
      gap: 8,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.06),
    },
    itemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    date: { fontSize: 16, fontWeight: '800', color: colors.text },
    range: { fontSize: 15, fontWeight: '600', color: colors.text },
    reason: { fontSize: 14, color: colors.text },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  });
