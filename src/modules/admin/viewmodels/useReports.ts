import { useMemo, useState } from 'react';
import {
  ChartPoint,
  ExportFormat,
  PeriodSummary,
  REPORT_PERIODS,
  ReportPeriod,
  ReportSnapshot,
  TopService,
} from '../models/reports';
import { CHART_DATA, TOP_SERVICES, YEARLY_REVENUE } from '../services/reportMock';
import { exportReportFile } from '../services/reportExport';
import { sumPoints } from '../utils/reportUtils';

// Hook con el estado y la lógica de la pantalla de reportes
export function useReports() {
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const [isExporting, setIsExporting] = useState(false);

  // Puntos de la gráfica del periodo seleccionado
  const chartPoints: ChartPoint[] = CHART_DATA[period];

  // Resumen de cada periodo, calculado con los mismos datos de la gráfica
  const summaries = useMemo<PeriodSummary[]>(
    () => REPORT_PERIODS.map((item) => ({ period: item, ...sumPoints(CHART_DATA[item]) })),
    [],
  );

  // Ranking ordenado de mayor a menor número de ventas
  const topServices = useMemo<TopService[]>(
    () => [...TOP_SERVICES].sort((a, b) => b.sales - a.sales),
    [],
  );

  // Genera el archivo (devuelve false si algo falla)
  const exportReport = async (format: ExportFormat): Promise<boolean> => {
    const snapshot: ReportSnapshot = { summaries, topServices, yearlyRevenue: YEARLY_REVENUE };

    setIsExporting(true);
    try {
      await exportReportFile(format, snapshot);
      return true;
    } catch {
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    period,
    setPeriod,
    chartPoints,
    summaries,
    topServices,
    yearlyRevenue: YEARLY_REVENUE,
    isExporting,
    exportReport,
  };
}
