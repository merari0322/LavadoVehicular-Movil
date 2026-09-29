import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { REPORT_TEXTS } from '../../constants/reportTexts';
import { ChartPoint } from '../../models/reports';
import { buildAxisTicks, formatCurrency } from '../../utils/reportUtils';

interface ReportsChartProps {
  points: ChartPoint[];
}

const texts = REPORT_TEXTS.chart;

const PLOT_HEIGHT = 200;

// Gráfica de barras dobles (servicios e ingresos). Al tocar una columna se muestra el detalle
export function ReportsChart({ points }: ReportsChartProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selected, setSelected] = useState<number | null>(null);

  // Al cambiar de periodo se oculta el detalle anterior
  useEffect(() => setSelected(null), [points]);

  const ticks = useMemo(
    () => buildAxisTicks(Math.max(...points.map((point) => point.services), 0)),
    [points],
  );
  const axisMax = ticks[ticks.length - 1];

  // Los ingresos se escalan con su propio máximo para poder compararlos en la misma gráfica
  const maxRevenue = Math.max(...points.map((point) => point.revenue), 0);

  const selectedPoint = selected !== null ? points[selected] : null;

  if (points.length === 0) {
    return <Text style={styles.empty}>{texts.empty}</Text>;
  }

  return (
    <View>
      <View style={styles.chartRow}>
        {/* Eje Y (de mayor a menor) */}
        <View style={styles.yAxis}>
          {[...ticks].reverse().map((tick) => (
            <Text key={tick} style={styles.axisLabel}>
              {tick}
            </Text>
          ))}
        </View>

        {/* Área de dibujo */}
        <View style={styles.plot}>
          {ticks.map((tick, index) => (
            <View
              key={tick}
              style={[styles.gridLine, { bottom: `${(index / (ticks.length - 1)) * 100}%` }]}
            />
          ))}

          <View style={styles.columns}>
            {points.map((point, index) => (
              <Pressable key={`${point.label}-${index}`} style={styles.column} onPress={() => setSelected(index)}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(point.services / axisMax) * 100}%`,
                      backgroundColor: colors.primaryHover,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          {/* Detalle de la columna seleccionada */}
          {selectedPoint && selected !== null ? (
            <View style={[styles.tooltip, selected < points.length / 2 ? styles.tooltipRight : styles.tooltipLeft]}>
              <Text style={styles.tooltipTitle}>{selectedPoint.label}</Text>
              <Text style={styles.tooltipText}>
                {texts.services}: {selectedPoint.services}
              </Text>
              <Text style={styles.tooltipText}>
                {texts.revenue}: {formatCurrency(selectedPoint.revenue)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Etiquetas del eje X */}
      <View style={styles.xAxis}>
        {points.map((point, index) => (
          <Text key={`${point.label}-${index}`} style={[styles.axisLabel, styles.xLabel]}>
            {point.label}
          </Text>
        ))}
      </View>

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.primaryHover }]} />
          <Text style={styles.axisLabel}>{texts.services}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.primary }]} />
          <Text style={styles.axisLabel}>{texts.revenue}</Text>
        </View>
      </View>
    </View>
  );
}

const Y_AXIS_WIDTH = 28;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    empty: { paddingVertical: 24, textAlign: 'center', fontSize: 14, color: colors.textSecondary },
    chartRow: { flexDirection: 'row', height: PLOT_HEIGHT },
    yAxis: { width: Y_AXIS_WIDTH, justifyContent: 'space-between' },
    axisLabel: { fontSize: 12, color: colors.textSecondary },
    plot: { flex: 1, borderLeftWidth: 1, borderLeftColor: colors.border },
    gridLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.border,
    },
    columns: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, flexDirection: 'row' },
    column: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 4,
    },
    bar: { width: 12, maxWidth: '35%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
    tooltip: {
      position: 'absolute',
      top: 4,
      gap: 2,
      padding: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    tooltipRight: { right: 8 },
    tooltipLeft: { left: 8 },
    tooltipTitle: { fontSize: 13, fontWeight: '800', color: colors.text },
    tooltipText: { fontSize: 12, color: colors.textSecondary },
    xAxis: { flexDirection: 'row', marginLeft: Y_AXIS_WIDTH, marginTop: 8 },
    xLabel: { flex: 1, textAlign: 'center' },
    legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendBox: { width: 12, height: 12, borderRadius: 3 },
  });
