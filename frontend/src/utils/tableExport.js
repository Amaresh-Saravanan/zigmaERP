import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function getHeaderValue(col) {
  return col.label || col.key || '';
}

function getCellValue(row, col) {
  if (col.sno) return '';
  const val = col.key ? col.key.split('.').reduce((o, k) => o?.[k], row) : '';
  return val ?? '';
}

function buildRowsAndHeaders(rows, columns) {
  const headers = columns.filter(c => !c.actions).map(getHeaderValue);
  const data = rows.map(row =>
    columns.filter(c => !c.actions).map(col => {
      const v = getCellValue(row, col);
      return typeof v === 'string' ? v : String(v ?? '');
    })
  );
  return { headers, data };
}

export function copyToClipboard(rows, columns) {
  const { headers, data } = buildRowsAndHeaders(rows, columns);
  const tsv = [headers.join('\t'), ...data.map(r => r.join('\t'))].join('\n');
  navigator.clipboard.writeText(tsv);
}

export function exportCSV(rows, columns, filename = 'export') {
  const { headers, data } = buildRowsAndHeaders(rows, columns);
  const csvContent = [headers, ...data]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}

export function exportExcel(rows, columns, filename = 'export') {
  const { headers, data } = buildRowsAndHeaders(rows, columns);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportPDF(rows, columns, filename = 'export', title = 'Report') {
  const { headers, data } = buildRowsAndHeaders(rows, columns);
  const doc = new jsPDF({ orientation: headers.length > 6 ? 'landscape' : 'portrait' });
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 34,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 169, 107] },
    margin: { top: 34 },
  });
  doc.save(`${filename}.pdf`);
}

export function printTable(rows, columns, title = 'Report') {
  const { headers, data } = buildRowsAndHeaders(rows, columns);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { margin-bottom: 4px; }
      .subtitle { color: #666; font-size: 12px; margin-bottom: 16px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
      th { background: #25a96b; color: #fff; }
      tr:nth-child(even) { background: #f9f9f9; }
    </style></head><body>
    <h2>${title}</h2>
    <div class="subtitle">Generated: ${new Date().toLocaleString()}</div>
    <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${data.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
    </body></html>
  `);
  printWindow.document.close();
  printWindow.print();
}
