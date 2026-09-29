import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { REPORT_TEXTS } from '../../constants/reportTexts';
import { TopService } from '../../models/reports';

interface TopServicesCardProps {
  services: TopService[];
}

const texts = REPORT_TEXTS.topServices;

// Tarjeta con el ranking de servicios más vendidos y su barra de progreso
export function TopServicesCard({ services }: TopServicesCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Cada posición usa un tono distinto (de más claro a más oscuro)
  const barColors = [colors.primary, colors.primaryHover, withAlpha(colors.primaryHover, 0.75)];

  // La barra más larga corresponde al servicio con más ventas
  const maxSales = Math.max(...services.map((item) => item.sales), 1);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <MaterialIcons name="emoji-events" size={22} color={colors.primary} />
        <Text style={styles.title}>{texts.title}</Text>
      </View>

      {services.length === 0 ? (
        <Text style={styles.empty}>{texts.empty}</Text>
      ) : (
        services.map((item, index) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemTop}>
              <View style={styles.rank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={[styles.name, styles.flex]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.sales}>{texts.sales(item.sales)}</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${(item.sales / maxSales) * 100}%`,
                    backgroundColor: barColors[index % barColors.length],
                  },
                ]}
              />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    card: {
      gap: 16,
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    empty: { fontSize: 14, color: colors.textSecondary },
    item: { gap: 8 },
    itemTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    rank: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    rankText: { fontSize: 13, fontWeight: '700', color: colors.primaryHover },
    name: { fontSize: 15, fontWeight: '700', color: colors.text },
    sales: { fontSize: 14, fontWeight: '700', color: colors.text },
    track: {
      height: 10,
      borderRadius: 5,
      overflow: 'hidden',
      backgroundColor: withAlpha(colors.textMuted, 0.15),
    },
    bar: { height: '100%', borderRadius: 5 },
  });
