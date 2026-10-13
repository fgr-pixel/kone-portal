'use client';
import { useRef, useState, useEffect } from 'react';

const STARTERS = ['What is Size ratio?', 'How do I define the MOQ?', 'Which EAN type should I use?'];

export default function Assistant({ brand }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'assistant', content: `Hi${brand ? ` ${brand} team` : ''}! Ask me anything about the fields in this form.` }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, open]);

  async function ask(q) {
    const question = (q ?? text).trim();
    if (!question || busy) return;
    const next = [...msgs, { role: 'user', content: question }];
    setMsgs(next); setText(''); setBusy(true);
    try {
      const r = await fetch('/api/assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(1), context: brand ? `Brand: ${brand}` : '' }),
      });
      const d = await r.json();
      setMsgs([...next, { role: 'assistant', content: d.reply || d.error || 'No answer. Please contact your K-ONE buyer.' }]);
    } catch {
      setMsgs([...next, { role: 'assistant', content: 'The assistant is offline. Please contact your K-ONE buyer.' }]);
    }
    setBusy(false);
  }

  if (!open) return <button type="button" className="chat-fab" onClick={() => setOpen(true)}>Need help?</button>;

  return (
    <aside className="chat" aria-label="Help assistant">
      <header><b>K-ONE help</b><button type="button" className="btn ghost" onClick={() => setOpen(false)} aria-label="Close">✕</button></header>
      <div className="chat-log">
        {msgs.map((m, i) => <p key={i} className={`msg ${m.role}`}>{m.content}</p>)}
        {busy && <p className="msg assistant muted">Thinking…</p>}
        {msgs.length === 1 && <div className="starters">{STARTERS.map(s => <button key={s} type="button" className="btn" onClick={() => ask(s)}>{s}</button>)}</div>}
        <div ref={end} />
      </div>
      <form onSubmit={e => { e.preventDefault(); ask(); }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type your question…" aria-label="Your question" maxLength={1000} />
        <button type="submit" className="btn primary" disabled={busy || !text.trim()}>Send</button>
      </form>
    </aside>
  );
}
