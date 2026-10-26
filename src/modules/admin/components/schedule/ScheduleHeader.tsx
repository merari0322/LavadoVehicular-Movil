import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { SCHEDULE_TEXTS } from '../../constants/scheduleTexts';

interface ScheduleHeaderProps {
  todayRange: string | null; // null = cerrado hoy
  onOpenHistory: () => void;
}

// Encabezado: título, estado de hoy y botón del historial
export function ScheduleHeader({ todayRange, onOpenHistory }: ScheduleHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isOpen = todayRange !== null;
  const statusColor = isOpen ? colors.primaryHover : colors.error;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.iconBox}>
          <MaterialIcons name="schedule" size={26} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.title}>{SCHEDULE_TEXTS.title}</Text>
          <Text style={styles.subtitle}>{SCHEDULE_TEXTS.subtitle}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {/* Estado de hoy */}
        <View
          style={[
            styles.status,
            { backgroundColor: isOpen ? withAlpha(colors.primary, 0.15) : colors.errorSoft },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]} numberOfLines={1}>
            {isOpen ? SCHEDULE_TEXTS.openToday(todayRange) : SCHEDULE_TEXTS.closedToday}
          </Text>
        </View>

        {/* Historial de cambios */}
        <Pressable style={styles.historyButton} onPress={onOpenHistory}>
          <MaterialIcons name="history" size={20} color={colors.text} />
          <Text style={styles.historyText}>{SCHEDULE_TEXTS.history}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: { gap: 14 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    title: { fontSize: 22, fontWeight: '800', color: colors.text },
    subtitle: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    status: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      height: 44,
      paddingHorizontal: 14,
      borderRadius: 999,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { flexShrink: 1, fontSize: 13, fontWeight: '700' },
    historyButton: {
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    historyText: { fontSize: 14, fontWeight: '700', color: colors.text },
  });
