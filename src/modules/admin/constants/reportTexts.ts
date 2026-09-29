import { ReportPeriod } from '../models/reports';

// Textos de la pantalla de reportes (centralizados para migrarlos fácil a i18n)
export const REPORT_TEXTS = {
  title: 'Reportes Generales de Servicios e Ingresos',
  subtitle: 'Visualiza el rendimiento del negocio',
  export: 'Exportar reporte',
  yearlyRevenue: 'Ingresos Totales del Año',
  servicesDone: 'Servicios realizados',
  totalRevenue: 'Ingresos totales',

  periods: {
    day: 'Día',
    week: 'Semana',
    month: 'Mes',
  } as Record<ReportPeriod, string>,

  summaryTitles: {
    day: 'Reporte del Día',
    week: 'Reporte de la Semana',
    month: 'Reporte del Mes',
  } as Record<ReportPeriod, string>,

  topServices: {
    title: 'Servicios Más Vendidos',
    sales: (total: number) => (total === 1 ? '1 venta' : `${total} ventas`),
    empty: 'Aún no hay ventas registradas',
  },

  chart: {
    title: 'Gráficas',
    subtitle: 'Servicios realizados e ingresos del período seleccionado',
    services: 'Servicios',
    revenue: 'Ingresos ($)',
    empty: 'No hay datos para este período',
  },

  // ---------------- Modal de exportación ----------------
  exportModal: {
    title: 'Exportar reporte',
    subtitle: 'Vista previa del reporte antes de descargarlo.',
    previewTitles: {
      day: 'Reporte del día',
      week: 'Reporte de la semana',
      month: 'Reporte del mes',
    } as Record<ReportPeriod, string>,
    summaryLine: (services: number, revenue: string) => `${services} servicios · ${revenue}`,
    excel: 'Exportar Excel',
    pdf: 'Exportar PDF',
    exporting: 'Generando archivo...',
    successTitle: 'Reporte generado',
    successMessage: 'El archivo se generó correctamente.',
    errorTitle: 'No se pudo exportar',
    errorMessage: 'Ocurrió un problema al generar el archivo. Inténtalo de nuevo.',
  },

  // ---------------- Contenido de los archivos exportados ----------------
  file: {
    title: 'Reporte general de servicios e ingresos',
    generatedOn: 'Generado el',
    period: 'Periodo',
    services: 'Servicios realizados',
    revenue: 'Ingresos',
    topServices: 'Servicios más vendidos',
    service: 'Servicio',
    sales: 'Ventas',
    yearlyRevenue: 'Ingresos totales del año',
    shareTitle: 'Compartir reporte',
  },
};
