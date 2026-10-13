// Recibe el Excel generado en el navegador y te lo manda por mail con Resend.
// No guarda nada: sin base de datos.

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function POST(req) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.KONE_INBOX;
  if (!apiKey || !to) return Response.json({ error: 'Email delivery is not configured.' }, { status: 503 });

  let b;
  try { b = await req.json(); } catch { return Response.json({ error: 'Bad request' }, { status: 400 }); }

  if (b.website) return Response.json({ ok: true }); // honeypot anti-bots
  if (!b.fileBase64 || !b.filename || !/\.xlsx$/.test(b.filename)) return Response.json({ error: 'Missing file' }, { status: 400 });
  if (b.fileBase64.length > 4_000_000) return Response.json({ error: 'File too large' }, { status: 413 });

  const brand = String(b.brand || 'Unknown brand').slice(0, 80);
  const styles = Array.isArray(b.styles) ? b.styles.slice(0, 300) : [];
  const html = `
    <h2>Nuevo envío de ${esc(brand)}</h2>
    <p><b>Proveedor:</b> ${esc(b.supplier)}<br>
       <b>Contacto:</b> ${esc(b.contact)} · ${esc(b.email)}<br>
       <b>Estilos:</b> ${styles.length}</p>
    ${b.notes ? `<p><b>Notas:</b> ${esc(b.notes)}</p>` : ''}
    <ul>${styles.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    <p>El archivo adjunto viene en la plantilla INVIERNO 2027 (70 columnas, valores en español) listo para revisar y subir a Bbook.</p>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || 'K-ONE Portal <onboarding@resend.dev>',
      to: to.split(',').map(s => s.trim()),
      reply_to: /^\S+@\S+\.\S+$/.test(b.email || '') ? b.email : undefined,
      subject: `[K-ONE W27] Product data · ${brand} · ${styles.length} styles`,
      html,
      attachments: [{ filename: b.filename, content: b.fileBase64 }],
    }),
  });

  if (!r.ok) return Response.json({ error: 'Could not send the email.' }, { status: 502 });
  return Response.json({ ok: true });
}
