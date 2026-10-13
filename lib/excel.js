import JSZip from 'jszip';
import { COLUMNS } from '../config/columns.js';

/*
  Arma el Excel para Bbook SIN reconstruirlo:
  abre la plantilla original (public/templates/INVIERNO_2027_ES.xlsx), deja
  intactas la fila 1 (instrucciones), la fila 2 (encabezados), la hoja "Listas",
  estilos y columnas ocultas, y solo agrega las filas de datos desde la fila 3.
  Así el archivo es idéntico al que Bbook ya acepta.
*/

const TEMPLATE_URL = '/templates/INVIERNO_2027_ES.xlsx';
const NUMERIC = new Set(['AO', 'AP', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ', 'BA', 'BB']);
const xmlEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function rowsToSheetXml(xml, rows) {
  const p = xml.includes('<x:sheetData') ? 'x:' : ''; // algunas plantillas usan prefijo x:
  let out = '';
  rows.forEach((r, i) => {
    const rn = i + 3;
    let cells = '';
    for (const { col } of COLUMNS) {
      const v = r[col];
      if (v === undefined || v === null || v === '') continue;
      const num = NUMERIC.has(col) && /^\d+(\.\d+)?$/.test(String(v));
      cells += num
        ? `<${p}c r="${col}${rn}"><${p}v>${v}</${p}v></${p}c>`
        : `<${p}c r="${col}${rn}" t="inlineStr"><${p}is><${p}t xml:space="preserve">${xmlEsc(v)}</${p}t></${p}is></${p}c>`;
    }
    out += `<${p}row r="${rn}">${cells}</${p}row>`;
  });
  const last = rows.length + 2;
  return xml
    .replace(`</${p}sheetData>`, `${out}</${p}sheetData>`)
    .replace(/<dimension ref="[^"]*"\/>/, `<dimension ref="A1:BR${last}"/>`)
    .replace(/<ignoredError sqref="A1:BR2"/, `<ignoredError sqref="A1:BR${last}"`);
}

export async function buildBbookXlsx(rows) {
  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) throw new Error('Template not found');
  const zip = await JSZip.loadAsync(await res.arrayBuffer());
  const path = 'xl/worksheets/sheet1.xml';
  const xml = await zip.file(path).async('string');
  zip.file(path, rowsToSheetXml(xml, rows));
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const blobToBase64 = blob => new Promise((ok, fail) => {
  const fr = new FileReader();
  fr.onload = () => ok(String(fr.result).split(',')[1]);
  fr.onerror = fail;
  fr.readAsDataURL(blob);
});

export const fileSlug = s => String(s || 'BRAND').normalize('NFD').replace(/[^\w]+/g, '_').replace(/^_|_$/g, '').toUpperCase();
