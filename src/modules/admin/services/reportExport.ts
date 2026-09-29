import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { REPORT_TEXTS } from '../constants/reportTexts';
import { ExportFormat, ReportSnapshot } from '../models/reports';
import { formatCurrency } from '../utils/reportUtils';
import { getTodayISO } from '../utils/reservationUtils';

const texts = REPORT_TEXTS.file;

// ---------------------------------------------------------------
// Construcción del contenido
// ---------------------------------------------------------------

// Escapa un valor para CSV
const csvCell = (value: string | number): string => `"${String(value).replace(/"/g, '""')}"`;

// Escapa texto para incrustarlo en HTML
const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Contenido CSV (Excel lo abre directamente)
const buildCsv = (snapshot: ReportSnapshot): string => {
  const rows: (string | number)[][] = [
    [texts.title],
    [texts.generatedOn, getTodayISO()],
    [],
    [texts.period, texts.services, texts.revenue],
    ...snapshot.summaries.map((item) => [
      REPORT_TEXTS.periods[item.period],
      item.services,
      item.revenue,
    ]),
    [],
    [texts.topServices],
    [texts.service, texts.sales],
    ...snapshot.topServices.map((item) => [item.name, item.sales]),
    [],
    [texts.yearlyRevenue, snapshot.yearlyRevenue],
  ];

  // El BOM inicial hace que Excel muestre bien las tildes
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\n');
};

// Contenido HTML que se convierte en PDF
const buildHtml = (snapshot: ReportSnapshot): string => {
  const summaryRows = snapshot.summaries
    .map(
      (item) =>
        `<tr><td>${REPORT_TEXTS.periods[item.period]}</td><td>${item.services}</td><td>${formatCurrency(item.revenue)}</td></tr>`,
    )
    .join('');

  const topRows = snapshot.topServices
    .map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${item.sales}</td></tr>`)
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a2e; }
          h1 { font-size: 22px; }
          h2 { font-size: 16px; margin-top: 28px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; font-size: 14px; }
          th { background: #f0faf8; }
          .muted { color: #666; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>${texts.title}</h1>
        <p class="muted">${texts.generatedOn} ${getTodayISO()}</p>
        <table>
          <tr><th>${texts.period}</th><th>${texts.services}</th><th>${texts.revenue}</th></tr>
          ${summaryRows}
        </table>
        <h2>${texts.topServices}</h2>
        <table>
          <tr><th>${texts.service}</th><th>${texts.sales}</th></tr>
          ${topRows}
        </table>
        <h2>${texts.yearlyRevenue}: ${formatCurrency(snapshot.yearlyRevenue)}</h2>
      </body>
    </html>`;
};

// ---------------------------------------------------------------
// Entrega del archivo
// ---------------------------------------------------------------

// En web se descarga el archivo usando el documento del navegador
const downloadOnWeb = (content: string, fileName: string, mimeType: string) => {
  const doc = (globalThis as any).document;
  const blob = new Blob([content], { type: mimeType });
  const url = (globalThis as any).URL.createObjectURL(blob);
  const link = doc.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  (globalThis as any).URL.revokeObjectURL(url);
};

const exportExcel = async (snapshot: ReportSnapshot) => {
  const csv = buildCsv(snapshot);
  const fileName = `reporte-${getTodayISO()}.csv`;

  if (Platform.OS === 'web') {
    downloadOnWeb(csv, fileName, 'text/csv;charset=utf-8');
    return;
  }

  // En móvil se guarda en caché y se abre el menú de compartir
  const uri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, csv);
  await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: texts.shareTitle });
};

const exportPdf = async (snapshot: ReportSnapshot) => {
  const html = buildHtml(snapshot);

  // En web no se puede generar archivo: se abre el diálogo de impresión (guardar como PDF)
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: texts.shareTitle,
  });
};

// Genera y entrega el reporte en el formato elegido
export const exportReportFile = async (format: ExportFormat, snapshot: ReportSnapshot) => {
  if (format === 'excel') await exportExcel(snapshot);
  else await exportPdf(snapshot);
};
