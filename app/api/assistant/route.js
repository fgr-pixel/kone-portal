import { SYSTEM_PROMPT } from '../../../config/assistant-prompt.js';

// Límite simple por IP (en memoria; suficiente para un portal chico).
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 60 * 60 * 1000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 40; // máx. 40 mensajes por hora por IP
}

export async function POST(req) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: 'The assistant is not configured yet.' }, { status: 503 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
  if (limited(ip)) return Response.json({ error: 'Too many questions. Please try again later.' }, { status: 429 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Bad request' }, { status: 400 }); }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content.slice(0, 1500) }));
  if (!messages.length) return Response.json({ error: 'Empty question' }, { status: 400 });

  const context = typeof body.context === 'string' ? body.context.slice(0, 300) : '';

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + (context ? `\n\nCurrent supplier: ${context}` : '') },
        ...messages,
      ],
    }),
  });

  if (!r.ok) return Response.json({ error: 'The assistant is not available right now.' }, { status: 502 });
  const data = await r.json();
  return Response.json({ reply: data.choices?.[0]?.message?.content?.trim() || '' });
}
