import { localized } from '../../../shared/i18n/localized';
import { ReportPeriod } from '../models/reports';

// Textos de la pantalla de reportes en los 4 idiomas de la app
const es = {
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

const en: typeof es = {
  title: 'General Services and Revenue Reports',
  subtitle: 'See how the business is performing',
  export: 'Export report',
  yearlyRevenue: 'Total Revenue of the Year',
  servicesDone: 'Services completed',
  totalRevenue: 'Total revenue',
  periods: { day: 'Day', week: 'Week', month: 'Month' },
  summaryTitles: { day: 'Daily Report', week: 'Weekly Report', month: 'Monthly Report' },
  topServices: {
    title: 'Best-Selling Services',
    sales: (total: number) => (total === 1 ? '1 sale' : `${total} sales`),
    empty: 'No sales recorded yet',
  },
  chart: {
    title: 'Charts',
    subtitle: 'Services completed and revenue for the selected period',
    services: 'Services',
    revenue: 'Revenue ($)',
    empty: 'No data for this period',
  },
  exportModal: {
    title: 'Export report',
    subtitle: 'Preview of the report before downloading it.',
    previewTitles: { day: 'Daily report', week: 'Weekly report', month: 'Monthly report' },
    summaryLine: (services: number, revenue: string) => `${services} services · ${revenue}`,
    excel: 'Export Excel',
    pdf: 'Export PDF',
    exporting: 'Generating file...',
    successTitle: 'Report generated',
    successMessage: 'The file was generated successfully.',
    errorTitle: 'Could not export',
    errorMessage: 'There was a problem generating the file. Please try again.',
  },
  file: {
    title: 'General services and revenue report',
    generatedOn: 'Generated on',
    period: 'Period',
    services: 'Services completed',
    revenue: 'Revenue',
    topServices: 'Best-selling services',
    service: 'Service',
    sales: 'Sales',
    yearlyRevenue: 'Total revenue of the year',
    shareTitle: 'Share report',
  },
};

const fr: typeof es = {
  title: 'Rapports généraux des services et revenus',
  subtitle: 'Visualisez la performance de l’entreprise',
  export: 'Exporter le rapport',
  yearlyRevenue: 'Revenus totaux de l’année',
  servicesDone: 'Services réalisés',
  totalRevenue: 'Revenus totaux',
  periods: { day: 'Jour', week: 'Semaine', month: 'Mois' },
  summaryTitles: { day: 'Rapport du jour', week: 'Rapport de la semaine', month: 'Rapport du mois' },
  topServices: {
    title: 'Services les plus vendus',
    sales: (total: number) => (total === 1 ? '1 vente' : `${total} ventes`),
    empty: 'Aucune vente enregistrée pour l’instant',
  },
  chart: {
    title: 'Graphiques',
    subtitle: 'Services réalisés et revenus de la période sélectionnée',
    services: 'Services',
    revenue: 'Revenus ($)',
    empty: 'Aucune donnée pour cette période',
  },
  exportModal: {
    title: 'Exporter le rapport',
    subtitle: 'Aperçu du rapport avant de le télécharger.',
    previewTitles: { day: 'Rapport du jour', week: 'Rapport de la semaine', month: 'Rapport du mois' },
    summaryLine: (services: number, revenue: string) => `${services} services · ${revenue}`,
    excel: 'Exporter Excel',
    pdf: 'Exporter PDF',
    exporting: 'Génération du fichier...',
    successTitle: 'Rapport généré',
    successMessage: 'Le fichier a été généré correctement.',
    errorTitle: 'Exportation impossible',
    errorMessage: 'Un problème est survenu lors de la génération du fichier. Réessayez.',
  },
  file: {
    title: 'Rapport général des services et revenus',
    generatedOn: 'Généré le',
    period: 'Période',
    services: 'Services réalisés',
    revenue: 'Revenus',
    topServices: 'Services les plus vendus',
    service: 'Service',
    sales: 'Ventes',
    yearlyRevenue: 'Revenus totaux de l’année',
    shareTitle: 'Partager le rapport',
  },
};

const pt: typeof es = {
  title: 'Relatórios Gerais de Serviços e Receitas',
  subtitle: 'Veja o desempenho do negócio',
  export: 'Exportar relatório',
  yearlyRevenue: 'Receita Total do Ano',
  servicesDone: 'Serviços realizados',
  totalRevenue: 'Receita total',
  periods: { day: 'Dia', week: 'Semana', month: 'Mês' },
  summaryTitles: { day: 'Relatório do Dia', week: 'Relatório da Semana', month: 'Relatório do Mês' },
  topServices: {
    title: 'Serviços Mais Vendidos',
    sales: (total: number) => (total === 1 ? '1 venda' : `${total} vendas`),
    empty: 'Ainda não há vendas registradas',
  },
  chart: {
    title: 'Gráficos',
    subtitle: 'Serviços realizados e receita do período selecionado',
    services: 'Serviços',
    revenue: 'Receita ($)',
    empty: 'Não há dados para este período',
  },
  exportModal: {
    title: 'Exportar relatório',
    subtitle: 'Prévia do relatório antes de baixá-lo.',
    previewTitles: { day: 'Relatório do dia', week: 'Relatório da semana', month: 'Relatório do mês' },
    summaryLine: (services: number, revenue: string) => `${services} serviços · ${revenue}`,
    excel: 'Exportar Excel',
    pdf: 'Exportar PDF',
    exporting: 'Gerando arquivo...',
    successTitle: 'Relatório gerado',
    successMessage: 'O arquivo foi gerado corretamente.',
    errorTitle: 'Não foi possível exportar',
    errorMessage: 'Ocorreu um problema ao gerar o arquivo. Tente novamente.',
  },
  file: {
    title: 'Relatório geral de serviços e receitas',
    generatedOn: 'Gerado em',
    period: 'Período',
    services: 'Serviços realizados',
    revenue: 'Receita',
    topServices: 'Serviços mais vendidos',
    service: 'Serviço',
    sales: 'Vendas',
    yearlyRevenue: 'Receita total do ano',
    shareTitle: 'Compartilhar relatório',
  },
};

export const REPORT_TEXTS = localized({ es, en, fr, pt });
