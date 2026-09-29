import React, { useMemo } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { REPORT_TEXTS } from '../../constants/reportTexts';
import { ExportFormat, PeriodSummary, TopService } from '../../models/reports';
import { formatCurrency } from '../../utils/reportUtils';

interface ExportReportModalProps {
  visible: boolean;
  summaries: PeriodSummary[];
  topServices: TopService[];
  isExporting: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
}

const texts = REPORT_TEXTS.exportModal;

// Modal con la vista previa del reporte y los botones para descargarlo
export function ExportReportModal({
  visible,
  summaries,
  topServices,
  isExporting,
  onClose,
  onExport,
}: ExportReportModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Encabezado */}
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.title}>{texts.title}</Text>
              <Text style={styles.subtitle}>{texts.subtitle}</Text>
            </View>
            <Pressable onPress={onClose} disabled={isExporting} hitSlop={10}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Resumen por periodo */}
            <View style={styles.grid}>
              {summaries.map((item) => (
                <View key={item.period} style={styles.previewTile}>
                  <Text style={styles.previewLabel}>{texts.previewTitles[item.period].toUpperCase()}</Text>
                  <Text style={styles.previewValue}>
                    {texts.summaryLine(item.services, formatCurrency(item.revenue))}
                  </Text>
                </View>
              ))}
            </View>

            {/* Servicios más vendidos */}
            <View style={styles.topBox}>
              <Text style={styles.topTitle}>{REPORT_TEXTS.topServices.title}</Text>
              {topServices.map((item) => (
                <View key={item.id} style={styles.topRow}>
                  <Text style={[styles.topName, styles.flex]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.topSales}>{REPORT_TEXTS.topServices.sales(item.sales)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Botones de descarga */}
          <View style={styles.footer}>
            {isExporting ? (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>{texts.exporting}</Text>
              </View>
            ) : (
              <View style={styles.buttons}>
                <Pressable style={[styles.button, styles.excelButton]} onPress={() => onExport('excel')}>
                  <MaterialIcons name="grid-on" size={20} color={colors.text} />
                  <Text style={styles.excelText}>{texts.excel}</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.pdfButton]} onPress={() => onExport('pdf')}>
                  <MaterialIcons name="picture-as-pdf" size={20} color={colors.onPrimary} />
                  <Text style={styles.pdfText}>{texts.pdf}</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
      maxHeight: '90%',
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 20 },
    title: { fontSize: 20, fontWeight: '800', color: colors.text },
    subtitle: { marginTop: 6, fontSize: 14, color: colors.textSecondary },
    body: { flexShrink: 1 },
    bodyContent: { gap: 14, paddingHorizontal: 20, paddingBottom: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    previewTile: {
      flexGrow: 1,
      flexBasis: '45%',
      gap: 6,
      padding: 14,
      borderRadius: 14,
      backgroundColor: withAlpha(colors.primary, 0.08),
    },
    previewLabel: { fontSize: 12, color: colors.textSecondary },
    previewValue: { fontSize: 15, fontWeight: '800', color: colors.text },
    topBox: {
      gap: 10,
      padding: 16,
      borderRadius: 14,
      backgroundColor: withAlpha(colors.textMuted, 0.1),
    },
    topTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    topName: { fontSize: 14, color: colors.text },
    topSales: { fontSize: 14, fontWeight: '800', color: colors.text },
    footer: { padding: 20 },
    buttons: { flexDirection: 'row', gap: 10 },
    button: {
      flex: 1,
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
    },
    excelButton: { backgroundColor: withAlpha(colors.textMuted, 0.12) },
    excelText: { fontSize: 14, fontWeight: '700', color: colors.text },
    pdfButton: { backgroundColor: colors.primary },
    pdfText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
    loading: {
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    loadingText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  });
