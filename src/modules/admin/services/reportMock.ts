import { ChartPoint, ReportPeriod, TopService } from '../models/reports';

// Datos de ejemplo de reportes (TODO: reemplazar por datos de la API)

// TODO: calcular en el backend
export const YEARLY_REVENUE = 330000;

export const TOP_SERVICES: TopService[] = [
  { id: 'svc-1', name: 'Lavado Básico', sales: 3 },
  { id: 'svc-2', name: 'Detallado Interior', sales: 1 },
  { id: 'svc-3', name: 'Básico — Camioneta', sales: 1 },
];

// Puntos de la gráfica por periodo (los resúmenes se calculan sumando estos valores)
export const CHART_DATA: Record<ReportPeriod, ChartPoint[]> = {
  day: [
    { label: '8h', services: 0, revenue: 0 },
    { label: '9h', services: 2, revenue: 40000 },
    { label: '10h', services: 3, revenue: 60000 },
    { label: '11h', services: 1, revenue: 20000 },
    { label: '12h', services: 0, revenue: 0 },
    { label: '14h', services: 2, revenue: 30000 },
    { label: '16h', services: 1, revenue: 15000 },
  ],
  week: [
    { label: 'mié', services: 0, revenue: 0 },
    { label: 'jue', services: 0, revenue: 0 },
    { label: 'vie', services: 0, revenue: 0 },
    { label: 'sáb', services: 0, revenue: 0 },
    { label: 'dom', services: 0, revenue: 0 },
    { label: 'lun', services: 1, revenue: 165000 },
    { label: 'mar', services: 11, revenue: 165000 },
  ],
  month: [
    { label: 'Sem 1', services: 0, revenue: 0 },
    { label: 'Sem 2', services: 0, revenue: 0 },
    { label: 'Sem 3', services: 1, revenue: 165000 },
    { label: 'Sem 4', services: 11, revenue: 165000 },
  ],
};
