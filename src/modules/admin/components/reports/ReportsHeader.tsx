import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { REPORT_TEXTS } from '../../constants/reportTexts';

interface ReportsHeaderProps {
  onExport: () => void;
}

// Encabezado: título, subtítulo y botón para exportar
export function ReportsHeader({ onExport }: ReportsHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.iconBox}>
          <MaterialIcons name="bar-chart" size={26} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.title}>{REPORT_TEXTS.title}</Text>
          <Text style={styles.subtitle}>{REPORT_TEXTS.subtitle}</Text>
        </View>
      </View>

      <Pressable style={styles.exportButton} onPress={onExport}>
        <MaterialIcons name="description" size={20} color={colors.onPrimary} />
        <Text style={styles.exportText}>{REPORT_TEXTS.export}</Text>
      </Pressable>
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
    exportButton: {
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    exportText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
  });
