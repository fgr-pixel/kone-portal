'use client';
import { optionsFor } from '../lib/rows.js';

export default function Field({ f, value, onChange, idPrefix = '' }) {
  const id = `${idPrefix}${f.col}`;
  const opts = f.input === 'list' ? optionsFor(f.col) : [];
  const set = e => onChange(f.col, e.target.value);
  let control;

  if (f.input === 'list' && f.searchable) {
    control = (
      <>
        <input id={id} list={`dl-${f.col}`} value={value || ''} onChange={set} placeholder="Type to search…" autoComplete="off" />
        <datalist id={`dl-${f.col}`}>{opts.map(o => <option key={o.en} value={o.en} />)}</datalist>
      </>
    );
  } else if (f.input === 'list') {
    control = (
      <select id={id} value={value || ''} onChange={set}>
        <option value="">Select…</option>
        {opts.map(o => <option key={o.en} value={o.en}>{o.en}</option>)}
      </select>
    );
  } else {
    const numeric = ['int', 'dec', 'pct'].includes(f.input);
    control = (
      <input id={id} value={value || ''} onChange={set}
        inputMode={f.input === 'int' ? 'numeric' : numeric ? 'decimal' : 'text'}
        className={numeric ? 'mono' : ''} placeholder={f.input === 'dec' || f.input === 'pct' ? '0.00' : ''} />
    );
  }

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{f.label}{f.required && <b> *</b>}</span>
      {control}
      {f.help && <em>{f.help}</em>}
    </label>
  );
}
