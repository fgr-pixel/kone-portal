import { COLUMNS, byCol } from '../config/columns.js';
import { LISTS } from '../config/lists.js';
import { KONE_DEFAULTS, GRUPO_COMPRA_POR_CATEGORIA } from '../config/kone-defaults.js';

/* ---------- listas ---------- */
export const optionsFor = col => {
  const name = byCol[col]?.list;
  return name && LISTS[name] ? LISTS[name] : [];
};
export const isListCol = col => optionsFor(col).length > 0 && col !== 'N';
export const enToEs = (col, v) => {
  if (v === '' || v == null) return v;
  const hit = optionsFor(col).find(o => o.en === String(v));
  return hit ? hit.es : v;
};
export const inList = (col, v) => optionsFor(col).some(o => o.en === String(v) || o.es === String(v));

/* ---------- EAN ---------- */
export function eanNormalize(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  return d.length === 12 ? '0' + d : d; // UPC-A (12) → EAN-13
}
export function eanValid(code) {
  if (!/^\d{13}$/.test(code)) return false;
  let s = 0;
  for (let i = 0; i < 12; i++) s += +code[i] * (i % 2 ? 3 : 1);
  return (10 - (s % 10)) % 10 === +code[12];
}

/* ---------- modelo ---------- */
export const blankStyle = () => ({
  id: Math.random().toString(36).slice(2, 10),
  code: '', sizes: [], H: 'ADULT', AR: 'DC only',
});

/** Fila en INGLÉS (lo que escribió el proveedor) — 40 columnas del proveedor. */
export function supplierRowEN(order, st) {
  const r = {};
  const put = (col, v) => { if (v !== undefined && v !== null && String(v).trim() !== '') r[col] = String(v).trim(); };
  for (const k of Object.keys(st)) if (/^[A-Z]{1,2}$/.test(k)) put(k, st[k]);
  for (const k of ['BG', 'BH', 'BI', 'BJ', 'BN', 'BO', 'BP']) put(k, order[k]);
  put('N', order.brand);
  const sz = (st.sizes || []).filter(s => String(s.size).trim());
  put('AL', sz.map(s => s.size.trim()).join(', '));
  if (sz.some(s => String(s.ratio).trim())) put('AM', sz.map(s => String(s.ratio).trim()).join(', '));
  if (sz.some(s => String(s.ean).trim())) put('BQ', sz.map(s => eanNormalize(s.ean)).join(', '));
  return r;
}

/** Fila final para Bbook: 70 columnas, valores en ESPAÑOL + defaults K-ONE. */
export function bbookRowES(order, st, meta = {}) {
  const en = supplierRowEN(order, st);
  const out = {};
  for (const c of COLUMNS) {
    let v = en[c.col];
    if (c.who === 'kone') {
      v = KONE_DEFAULTS[c.col] ?? '';
      if (v === '__SENDER__') v = `Enviado por ${order.brand || '?'} · ${order.email || ''} · ${meta.date || ''}`.trim();
    }
    if (c.col === 'V' && !v) v = st.code || '';
    if (c.col === 'AH' && !v && en.D) v = GRUPO_COMPRA_POR_CATEGORIA[String(en.D).split(' - ')[0]] || '';
    if (v !== undefined && v !== '') out[c.col] = enToEs(c.col, v);
  }
  return out;
}

/* ---------- validación ---------- */
const INT = /^\d+$/;
const DEC = /^\d+(\.\d{1,2})?$/;

export function validateStyle(order, st) {
  const E = [], W = [];
  const r = supplierRowEN(order, st);
  const label = col => (byCol[col]?.en || col).replace('(*) ', '');
  for (const col of ['C', 'D', 'F', 'J', 'AN', 'AY']) if (!r[col]) E.push(`${label(col)} is required`);
  for (const col of Object.keys(r)) {
    if (!isListCol(col)) continue;
    if (!inList(col, r[col])) E.push(`${label(col)}: "${r[col]}" is not an allowed value`);
  }
  const sizes = (st.sizes || []).filter(s => String(s.size).trim());
  if (!sizes.length) E.push('Add at least one size');
  sizes.forEach(s => {
    if (String(s.ratio).trim() && !INT.test(String(s.ratio).trim())) E.push(`Size ${s.size}: pack ratio must be a whole number`);
    const e = eanNormalize(s.ean);
    if (!s.ean) E.push(`Size ${s.size}: EAN is missing`);
    else if (!eanValid(e)) E.push(`Size ${s.size}: EAN ${s.ean} is not valid (check digit)`);
  });
  const eans = sizes.map(s => eanNormalize(s.ean)).filter(Boolean);
  const dup = eans.filter((e, i) => eans.indexOf(e) !== i);
  if (dup.length) E.push(`Duplicate EAN: ${[...new Set(dup)].join(', ')}`);
  for (const col of ['AP', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'BB']) if (r[col] && !INT.test(r[col])) E.push(`${label(col)} must be a whole number`);
  for (const col of ['AY', 'AZ', 'BA']) if (r[col] && !DEC.test(r[col])) E.push(`${label(col)} must be a number with up to 2 decimals (use a dot)`);
  for (const col of ['AZ', 'BA']) if (r[col] && +r[col] > 100) E.push(`${label(col)} must be between 0 and 100`);
  if (String(r.D || '').startsWith('FOOTWEAR')) for (const col of ['BC', 'BD', 'BE', 'BF']) if (!r[col]) W.push(`Footwear: ${label(col)} is empty`);
  if (eans.length && !r.BR) W.push('EAN type is empty');
  if (!r.AX) W.push('MOQ is empty');
  return { E, W };
}

export function validateOrder(order) {
  const E = [];
  if (!order.brand) E.push('Brand is required');
  if (!order.email || !/^\S+@\S+\.\S+$/.test(order.email)) E.push('A valid contact email is required');
  for (const [col, n] of [['BG', 'Supplier legal name'], ['BJ', 'Currency'], ['BH', 'Incoterm'], ['BI', 'Shipping mode']]) if (!order[col]) E.push(`${n} is required`);
  for (const col of ['BJ', 'BH', 'BI', 'BN', 'BO', 'BP']) if (order[col] && !inList(col, order[col])) E.push(`${col}: "${order[col]}" is not an allowed value`);
  return E;
}
