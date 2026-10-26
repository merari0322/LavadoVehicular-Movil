// Modelos y tipos del módulo de reportes

export type ReportPeriod = 'day' | 'week' | 'month';
export const REPORT_PERIODS: ReportPeriod[] = ['day', 'week', 'month'];

export type ExportFormat = 'excel' | 'pdf';

// Punto de la gráfica (una hora, un día o una semana según el periodo)
export interface ChartPoint {
  label: string;
  services: number;
  revenue: number;
}

// Servicio del ranking de más vendidos
export interface TopService {
  id: string;
  name: string;
  sales: number;
}

// Resumen de un periodo (servicios realizados e ingresos)
export interface PeriodSummary {
  period: ReportPeriod;
  services: number;
  revenue: number;
}

// Datos completos que se envían a la exportación
export interface ReportSnapshot {
  summaries: PeriodSummary[];
  topServices: TopService[];
  yearlyRevenue: number;
}
