import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { ChartCard } from '../components/reports/ChartCard';
import { ExportReportModal } from '../components/reports/ExportReportModal';
import { PeriodSummaryCards } from '../components/reports/PeriodSummaryCards';
import { ReportsHeader } from '../components/reports/ReportsHeader';
import { TopServicesCard } from '../components/reports/TopServicesCard';
import { TotalRevenueCard } from '../components/reports/TotalRevenueCard';
import { REPORT_TEXTS } from '../constants/reportTexts';
import { ExportFormat } from '../models/reports';
import { useReports } from '../viewmodels/useReports';

export const AdminReportsScreen = () => {
  // vuelve a pintar la pantalla cuando cambia el idioma
  useTranslation();
  const reports = useReports();

  const [exportVisible, setExportVisible] = useState(false);

  // Genera el archivo y avisa si salió bien o si falló
  const handleExport = async (format: ExportFormat) => {
    const texts = REPORT_TEXTS.exportModal;
    const exported = await reports.exportReport(format);

    if (exported) {
      setExportVisible(false);
      Alert.alert(texts.successTitle, texts.successMessage);
    } else {
      Alert.alert(texts.errorTitle, texts.errorMessage);
    }
  };

  return (
    <AdminLayout activeKey="reports">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ReportsHeader onExport={() => setExportVisible(true)} />

          <View style={styles.section}>
            <TotalRevenueCard revenue={reports.yearlyRevenue} />
            <TopServicesCard services={reports.topServices} />
          </View>

          <ChartCard
            period={reports.period}
            points={reports.chartPoints}
            onChangePeriod={reports.setPeriod}
          />

          <PeriodSummaryCards summaries={reports.summaries} />
        </ScrollView>
      </SafeAreaView>

      {/* Modal de exportación */}
      <ExportReportModal
        visible={exportVisible}
        summaries={reports.summaries}
        topServices={reports.topServices}
        isExporting={reports.isExporting}
        onClose={() => setExportVisible(false)}
        onExport={handleExport}
      />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // El espacio de abajo evita que la barra inferior flotante tape el contenido
  content: { gap: 16, padding: 16, paddingBottom: 130 },
  section: { gap: 16 },
});
