'use client';
import { useState } from 'react';
import { eanNormalize, eanValid } from '../lib/rows.js';

export default function SizeGrid({ sizes, onChange }) {
  const [draft, setDraft] = useState(sizes.map(s => s.size).join(', '));

  const apply = () => {
    const names = draft.split(',').map(s => s.trim()).filter(Boolean);
    onChange(names.map(n => sizes.find(s => s.size === n) || { size: n, ratio: '1', ean: '' }));
  };
  const edit = (i, k, v) => onChange(sizes.map((s, j) => (j === i ? { ...s, [k]: v } : s)));

  // Pegar una columna de códigos desde Excel rellena todas las tallas hacia abajo.
  const paste = (i, e) => {
    const parts = e.clipboardData.getData('text').split(/[\r\n\t,;]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) return;
    e.preventDefault();
    onChange(sizes.map((s, j) => (j >= i && parts[j - i] ? { ...s, ean: parts[j - i] } : s)));
  };

  return (
    <div className="sizegrid">
      <div className="row">
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }}
          placeholder="Sizes separated by commas: XS, S, M, L  or  40, 41, 42" />
        <button type="button" className="btn" onClick={apply}>Set sizes</button>
      </div>
      {sizes.length > 0 && (
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Size</th><th className="num">Units per pack</th><th>EAN / UPC</th><th /></tr></thead>
            <tbody>
              {sizes.map((s, i) => {
                const ok = !s.ean || eanValid(eanNormalize(s.ean));
                return (
                  <tr key={s.size}>
                    <td className="mono">{s.size}</td>
                    <td className="num"><input className="mono small" inputMode="numeric" value={s.ratio} onChange={e => edit(i, 'ratio', e.target.value)} aria-label={`Units of size ${s.size} per pack`} /></td>
                    <td><input className={`mono ${ok ? '' : 'err'}`} inputMode="numeric" value={s.ean} placeholder="13 digits"
                      onChange={e => edit(i, 'ean', e.target.value)} onPaste={e => paste(i, e)} aria-label={`EAN for size ${s.size}`} /></td>
                    <td className="hint">{s.ean ? (ok ? '✓' : 'check digit') : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {sizes.length > 1 && <p className="hint">Tip: copy a column of barcodes in Excel and paste it into the first EAN cell.</p>}
    </div>
  );
}
