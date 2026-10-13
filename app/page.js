'use client';
import { useEffect, useState } from 'react';
import Field from '../components/Field.js';
import StyleCard from '../components/StyleCard.js';
import Assistant from '../components/Assistant.js';
import { ORDER_FIELDS } from '../config/fields.js';
import { blankStyle, bbookRowES, validateOrder, validateStyle } from '../lib/rows.js';
import { buildBbookXlsx, downloadBlob, blobToBase64, fileSlug } from '../lib/excel.js';

const KEY = 'kone-portal-draft-v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };

export default function Home() {
  const [state, setState] = useState({ order: { brand: '' }, styles: [blankStyle()], started: false });
  const [openId, setOpenId] = useState(null);
  const [brandInput, setBrandInput] = useState('');
  const [status, setStatus] = useState(null); // {kind, text}
  const [busy, setBusy] = useState(false);

  useEffect(() => { const d = load(); if (d) { setState(d); setOpenId(d.styles[0]?.id); setBrandInput(d.order?.brand || ''); } }, []);
  useEffect(() => { save(state); }, [state]);

  const { order, styles } = state;
  const setOrder = (col, v) => setState(s => ({ ...s, order: { ...s.order, [col]: v } }));
  const setStyle = st => setState(s => ({ ...s, styles: s.styles.map(x => (x.id === st.id ? st : x)) }));

  /* ---------- 1. Identificación de marca ---------- */
  if (!state.started) {
    return (
      <main className="gate">
        <div className="gate-box">
          <p className="eyebrow">K-ONE · Winter 2027</p>
          <h1>Supplier product portal</h1>
          <p className="lede">Enter the product data for your K-ONE order in one place. No account needed.</p>
          <form onSubmit={e => {
            e.preventDefault();
            const b = brandInput.trim().toUpperCase();
            if (!b) return;
            setState(s => ({ ...s, started: true, order: { ...s.order, brand: b } }));
            setOpenId(styles[0]?.id);
          }}>
            <label className="field" htmlFor="brand">
              <span className="field-label">Your brand name</span>
              <input id="brand" autoFocus value={brandInput} onChange={e => setBrandInput(e.target.value)} placeholder="e.g. SAYSKY" autoComplete="organization" />
            </label>
            <button className="btn primary big" disabled={!brandInput.trim()}>Start</button>
          </form>
        </div>
      </main>
    );
  }

  /* ---------- 2. Formulario ---------- */
  const orderErrors = validateOrder(order);
  const checks = styles.map(st => validateStyle(order, st));
  const errorCount = orderErrors.length + checks.reduce((a, c) => a + c.E.length, 0);

  async function makeFile() {
    const date = new Date().toLocaleDateString('es-CL');
    const rows = styles.map(st => bbookRowES(order, st, { date }));
    const blob = await buildBbookXlsx(rows);
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return { blob, filename: `INVIERNO_2027_${fileSlug(order.brand)}_${stamp}.xlsx` };
  }

  async function submit() {
    setBusy(true); setStatus(null);
    try {
      const { blob, filename } = await makeFile();
      const r = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: order.brand, supplier: order.BG, contact: order.contact, email: order.email, notes: order.notes,
          website: order.website, filename, fileBase64: await blobToBase64(blob),
          styles: styles.map(s => `${s.C || '?'} · ${s.F || '?'} · ${s.sizes.length} sizes`),
        }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Send failed');
      downloadBlob(blob, filename);
      setStatus({ kind: 'ok', text: 'Sent! K-ONE received your file. A copy was downloaded for your records.' });
    } catch (e) {
      setStatus({ kind: 'bad', text: `${e.message}. Please use "Download Excel" and email the file to your K-ONE buyer.` });
    }
    setBusy(false);
  }

  return (
    <>
      <header className="top">
        <div>
          <p className="eyebrow">K-ONE · Winter 2027 · Jan–Jun</p>
          <h1>{order.brand} · Product data</h1>
        </div>
        <button type="button" className="btn ghost" onClick={() => setState(s => ({ ...s, started: false }))}>Change brand</button>
      </header>

      <main className="wrap">
        <section className="card">
          <h2>Your company &amp; shipping</h2>
          <p className="lede">Filled once, applied to every style.</p>
          <div className="grid">
            <label className="field"><span className="field-label">Contact name</span><input value={order.contact || ''} onChange={e => setOrder('contact', e.target.value)} autoComplete="name" /></label>
            <label className="field"><span className="field-label">Contact email <b>*</b></span><input type="email" value={order.email || ''} onChange={e => setOrder('email', e.target.value)} autoComplete="email" /></label>
            {ORDER_FIELDS.map(f => <Field key={f.col} f={f} value={order[f.col]} onChange={setOrder} idPrefix="o-" />)}
            <label className="field wide"><span className="field-label">Notes for K-ONE</span><input value={order.notes || ''} onChange={e => setOrder('notes', e.target.value)} placeholder="Optional" /></label>
            <input className="hp" tabIndex={-1} autoComplete="off" value={order.website || ''} onChange={e => setOrder('website', e.target.value)} aria-hidden="true" />
          </div>
        </section>

        <section className="stack">
          <div className="row">
            <div><h2>Styles</h2><p className="lede">One entry per style and colorway.</p></div>
            <span className="spacer" />
            <button type="button" className="btn primary" onClick={() => { const st = blankStyle(); setState(s => ({ ...s, styles: [...s.styles, st] })); setOpenId(st.id); }}>+ Add style</button>
          </div>
          {styles.map(st => (
            <StyleCard key={st.id} order={order} st={st} open={openId === st.id}
              onToggle={() => setOpenId(openId === st.id ? null : st.id)}
              onChange={setStyle}
              onDuplicate={() => {
                const c = { ...JSON.parse(JSON.stringify(st)), id: blankStyle().id, F: '', G: '', sizes: st.sizes.map(s => ({ ...s, ean: '' })) };
                setState(s => { const i = s.styles.findIndex(x => x.id === st.id); const arr = [...s.styles]; arr.splice(i + 1, 0, c); return { ...s, styles: arr }; });
                setOpenId(c.id);
              }}
              onDelete={() => setState(s => ({ ...s, styles: s.styles.filter(x => x.id !== st.id) }))} />
          ))}
        </section>

        <section className="card">
          <h2>Send to K-ONE</h2>
          {errorCount > 0
            ? <><p className="lede">Fix {errorCount} item{errorCount > 1 ? 's' : ''} marked in red before sending.</p>
                {orderErrors.length > 0 && <ul className="issues">{orderErrors.map(e => <li key={e}>{e}</li>)}</ul>}</>
            : <p className="lede">Everything checks out. {styles.length} style{styles.length > 1 ? 's' : ''} ready.</p>}
          <div className="row">
            <button type="button" className="btn primary big" disabled={busy || errorCount > 0 || !styles.length} onClick={submit}>{busy ? 'Sending…' : 'Submit to K-ONE'}</button>
            <button type="button" className="btn" disabled={busy || errorCount > 0 || !styles.length} onClick={async () => { const { blob, filename } = await makeFile(); downloadBlob(blob, filename); }}>Download Excel</button>
          </div>
          {status && <p className={`status ${status.kind}`} role="status">{status.text}</p>}
        </section>
      </main>
      <Assistant brand={order.brand} />
    </>
  );
}
