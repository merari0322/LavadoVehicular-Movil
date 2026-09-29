import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';

interface OperatorsHeaderProps {
  onAssignShifts: () => void;
  onCreate: () => void;
}

// Encabezado de la lista: título y botones principales
export function OperatorsHeader({ onAssignShifts, onCreate }: OperatorsHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.iconBox}>
          <MaterialIcons name="engineering" size={26} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.title}>{OPERATOR_TEXTS.title}</Text>
          <Text style={styles.subtitle}>{OPERATOR_TEXTS.subtitle}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.outlineButton]} onPress={onAssignShifts}>
          <MaterialIcons name="event" size={20} color={colors.text} />
          <Text style={styles.outlineText}>{OPERATOR_TEXTS.assignShifts}</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.primaryButton]} onPress={onCreate}>
          <MaterialIcons name="person-add" size={20} color={colors.onPrimary} />
          <Text style={styles.primaryText}>{OPERATOR_TEXTS.newOperator}</Text>
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
    actions: { flexDirection: 'row', gap: 10 },
    button: {
      flex: 1,
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 12,
    },
    outlineButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    outlineText: { fontSize: 14, fontWeight: '700', color: colors.text },
    primaryButton: { backgroundColor: colors.primary },
    primaryText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
  });
