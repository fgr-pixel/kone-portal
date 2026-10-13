'use client';
import { useState } from 'react';
import Field from './Field.js';
import SizeGrid from './SizeGrid.js';
import { STYLE_GROUPS } from '../config/fields.js';
import { validateStyle } from '../lib/rows.js';

export default function StyleCard({ order, st, open, onToggle, onChange, onDuplicate, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const { E, W } = validateStyle(order, st);
  const set = (col, v) => onChange({ ...st, [col]: v });
  const isFootwear = String(st.D || '').startsWith('FOOTWEAR');
  const n = st.sizes.filter(s => s.size).length;

  return (
    <div className="card style">
      <button type="button" className="style-head" onClick={onToggle} aria-expanded={open}>
        <span className="ttl">{st.C || 'Untitled style'}</span>
        <span className="sub">{st.F || 'no colorway'} · {n} size{n === 1 ? '' : 's'}</span>
        <span className="spacer" />
        {E.length ? <span className="pill bad">{E.length} to fix</span> : W.length ? <span className="pill warn">{W.length} warning{W.length > 1 ? 's' : ''}</span> : <span className="pill ok">Ready</span>}
      </button>

      {open && (
        <div className="style-body">
          <label className="field">
            <span className="field-label">Your style / article code</span>
            <input className="mono" value={st.code} onChange={e => onChange({ ...st, code: e.target.value })} placeholder="e.g. SAY-2401" />
            <em>Your internal reference. Helps K-ONE match your invoices.</em>
          </label>

          {STYLE_GROUPS.filter(g => !g.footwearOnly || isFootwear).map(g => (
            <fieldset key={g.title}>
              <legend>{g.title}</legend>
              <div className="grid">
                {g.fields.map(f => f.input === 'sizes'
                  ? <div key={f.col} className="wide">
                      <span className="field-label">{f.label} <b>*</b></span>
                      <em className="block-help">{f.help}</em>
                      <SizeGrid sizes={st.sizes} onChange={sizes => onChange({ ...st, sizes })} />
                    </div>
                  : <Field key={f.col} f={f} value={st[f.col]} onChange={set} idPrefix={`${st.id}-`} />)}
              </div>
            </fieldset>
          ))}

          {(E.length > 0 || W.length > 0) && (
            <ul className="issues">
              {E.map(e => <li key={e}>{e}</li>)}
              {W.map(w => <li key={w} className="w">{w}</li>)}
            </ul>
          )}

          <div className="row">
            <button type="button" className="btn" onClick={onDuplicate}>Duplicate as new color</button>
            <span className="spacer" />
            {confirm
              ? <span className="confirm">Delete this style? <button type="button" className="btn danger" onClick={onDelete}>Delete</button><button type="button" className="btn ghost" onClick={() => setConfirm(false)}>Keep</button></span>
              : <button type="button" className="btn ghost danger" onClick={() => setConfirm(true)}>Delete style</button>}
          </div>
        </div>
      )}
    </div>
  );
}
