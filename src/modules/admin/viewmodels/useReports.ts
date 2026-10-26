import { useEffect, useMemo, useState } from 'react';
import {
  ChartPoint,
  ExportFormat,
  PeriodSummary,
  REPORT_PERIODS,
  ReportPeriod,
  ReportSnapshot,
  TopService,
} from '../models/reports';
import { exportReportFile } from '../services/reportExport';
import { sumPoints } from '../utils/reportUtils';
import { bookingService } from '../../../core/services/booking/BookingService';
import { BookingResponse } from '../../../core/services/booking/booking.types';
import { toISODate } from '../../../shared/utils/format';

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
// el booking-service lista como máximo 62 días por consulta
const CHUNK_DAYS = 60;

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// reservas terminadas desde "from" hasta hoy, pidiendo por tramos
async function completedSince(from: Date): Promise<BookingResponse[]> {
  const result: BookingResponse[] = [];
  const today = new Date();
  for (let start = new Date(from); start <= today; ) {
    const end = new Date(start);
    end.setDate(end.getDate() + CHUNK_DAYS);
    const to = end > today ? today : end;
    result.push(...(await bookingService.adminBookings(toISODate(start), toISODate(to), 'COMPLETED')));
    start = new Date(to);
    start.setDate(start.getDate() + 1);
  }
  return result;
}

const point = (label: string, list: BookingResponse[]): ChartPoint => ({
  label,
  services: list.length,
  revenue: list.reduce((sum, b) => sum + b.total, 0),
});

// gráficas por periodo con las reservas terminadas (ingresos = total de cada reserva)
function buildChart(completed: BookingResponse[]): Record<ReportPeriod, ChartPoint[]> {
  const todayISO = toISODate(new Date());
  const today = completed.filter((b) => b.date === todayISO);
  const hours = Array.from(new Set(today.map((b) => Number(b.startTime.slice(0, 2))))).sort((a, b) => a - b);

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = daysAgo(6 - i);
    const iso = toISODate(day);
    return point(WEEKDAYS[day.getDay()], completed.filter((b) => b.date === iso));
  });

  const month = Array.from({ length: 4 }, (_, i) => {
    const from = toISODate(daysAgo(27 - i * 7));
    const to = toISODate(daysAgo(21 - i * 7));
    return point(`Sem ${i + 1}`, completed.filter((b) => b.date >= from && b.date <= to));
  });

  return {
    day: hours.map((h) => point(`${h}h`, today.filter((b) => Number(b.startTime.slice(0, 2)) === h))),
    week,
    month,
  };
}

// Hook con el estado y la lógica de la pantalla de reportes (datos de booking-service)
export function useReports() {
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const [isExporting, setIsExporting] = useState(false);
  const [completed, setCompleted] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // reservas terminadas desde el 1 de enero (sirven para el año, el mes, la semana y el día)
  useEffect(() => {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    completedSince(startOfYear)
      .then(setCompleted)
      .catch(() => setCompleted([]))
      .finally(() => setLoading(false));
  }, []);

  const chart = useMemo(() => buildChart(completed), [completed]);

  // Puntos de la gráfica del periodo seleccionado
  const chartPoints: ChartPoint[] = chart[period];

  // Resumen de cada periodo, calculado con los mismos datos de la gráfica
  const summaries = useMemo<PeriodSummary[]>(
    () => REPORT_PERIODS.map((item) => ({ period: item, ...sumPoints(chart[item]) })),
    [chart],
  );

  // servicios más vendidos en los últimos 30 días
  const topServices = useMemo<TopService[]>(() => {
    const since = toISODate(daysAgo(30));
    const counts = new Map<string, TopService>();
    completed
      .filter((b) => b.date >= since)
      .forEach((b) =>
        b.services.forEach((s) => {
          const current = counts.get(String(s.serviceId)) ?? { id: String(s.serviceId), name: s.name, sales: 0 };
          counts.set(String(s.serviceId), { ...current, sales: current.sales + s.quantity });
        }),
      );
    return [...counts.values()].sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [completed]);

  const yearlyRevenue = useMemo(() => completed.reduce((sum, b) => sum + b.total, 0), [completed]);

  // Genera el archivo (devuelve false si algo falla)
  const exportReport = async (format: ExportFormat): Promise<boolean> => {
    const snapshot: ReportSnapshot = { summaries, topServices, yearlyRevenue };

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
    yearlyRevenue,
    isExporting,
    exportReport,
    loading,
  };
}
