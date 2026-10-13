# K-ONE Supplier Portal (Winter 2027)

Portal en inglés para que las marcas carguen sus productos. Genera la planilla **INVIERNO 2027** con las 70 columnas en su orden exacto y los **valores en español** que pide Bbook, y te la manda por mail.

## Cómo funciona

```
Proveedor (navegador)                       Vercel (gratis)                  Tú
─────────────────────                       ───────────────                  ──
1. Escribe su marca
2. Llena las 40 columnas  ──► valida en vivo (EAN, listas, números)
3. Submit ──► arma el .xlsx en el navegador
              (plantilla original + filas)  ──► /api/submit ──► Resend ──► 📎 a tu mail
              y descarga una copia
   Chat "Need help?" ───────────────────────► /api/assistant ──► OpenAI
```

- **Sin base de datos.** El borrador queda guardado en el navegador del proveedor.
- **Excel idéntico:** no se reconstruye. Se abre `public/templates/INVIERNO_2027_ES.xlsx` (tu plantilla original) y se agregan filas desde la fila 3. Las instrucciones, los encabezados, la hoja Listas, las columnas ocultas y los estilos quedan intactos.
- **Una fila = un estilo en un color.** Tallas, curva y EAN van separados por coma, como pide la plantilla.

## Dónde se edita cada cosa

| Quieres cambiar… | Archivo |
|---|---|
| Opciones de las listas desplegables (pegar nuevas) | `config/lists.js` |
| Valores por defecto de las 30 columnas internas | `config/kone-defaults.js` |
| Textos, ayudas y orden de los campos del formulario | `config/fields.js` |
| Comportamiento del asistente | `config/assistant-prompt.js` |
| Plantilla Excel | reemplaza `public/templates/INVIERNO_2027_ES.xlsx` (mismo nombre) |
| Colores | `app/globals.css` (bloque `:root`) |

**Pegar listas:** en `config/lists.js` va una opción por línea, en formato `VALOR EN | VALOR ES`, o solo `VALOR` si es igual en los dos idiomas. También puedes copiar dos columnas desde Excel y pegarlas tal cual (quedan separadas por TAB).

---

## Despliegue paso a paso (≈30 minutos, $0)

### 0. Lo que necesitas
- Una cuenta de **GitHub** (gratis): https://github.com/signup
- Una cuenta de **Vercel** (gratis, entra con GitHub): https://vercel.com/signup
- Una cuenta de **Resend** (gratis, 3.000 mails/mes): https://resend.com/signup — **regístrate con pipe.gonthier@gmail.com**, porque sin dominio propio Resend solo envía al mail de tu cuenta.
- Una **API key de OpenAI** con saldo (US$5 alcanzan para meses): https://platform.openai.com/api-keys

### 1. Sube el código a GitHub (sin usar la terminal)
1. Descomprime `kone-supplier-portal.zip`.
2. En GitHub: **New repository** → nombre `kone-supplier-portal` → **Private** → **Create repository**.
3. En la página del repo vacío: **uploading an existing file**.
4. Arrastra **todo el contenido** de la carpeta (las carpetas `app`, `components`, `config`, `lib`, `public` y los archivos `package.json`, `next.config.js`, etc.). No subas la carpeta contenedora, sino lo que hay adentro.
5. **Commit changes**.

### 2. Crea las claves
- **Resend:** API Keys → **Create API Key** → copia la clave (`re_...`).
- **OpenAI:** API keys → **Create new secret key** → copia la clave (`sk-...`). En **Billing**, carga saldo y pon un límite mensual (por ejemplo US$5).

### 3. Despliega en Vercel
1. Vercel → **Add New… → Project** → importa `kone-supplier-portal`.
2. Framework: lo detecta solo (**Next.js**). No cambies nada.
3. Abre **Environment Variables** y agrega:

| Name | Value |
|---|---|
| `OPENAI_API_KEY` | tu `sk-...` |
| `RESEND_API_KEY` | tu `re_...` |
| `KONE_INBOX` | `pipe.gonthier@gmail.com` |

4. **Deploy**. En 1–2 minutos te entrega una URL como `kone-supplier-portal.vercel.app`.

### 4. Prueba antes de mandarlo a las marcas
1. Abre la URL, entra como `TEST`, llena un estilo completo y aprieta **Submit to K-ONE**.
2. Revisa que te llegue el mail con el Excel adjunto (mira también en Spam la primera vez).
3. Abre el Excel: fila 2 con los encabezados en español y fila 3 con los datos.
4. **Haz una carga de prueba en Bbook con ese archivo.** Es la única forma de confirmar al 100% que lo acepta.
5. Prueba el chat con "What is Size ratio?".

### 5. Comparte
Manda la URL a las marcas. No necesitan cuenta ni contraseña.

### Cambios después
Edita el archivo en GitHub (ícono de lápiz) → **Commit**. Vercel publica solo en ~1 minuto.

---

## Opcional

- **Dominio propio** (`proveedores.k-one.cl`): en Vercel, Settings → Domains. Si además verificas el dominio en Resend, puedes usar `MAIL_FROM=K-ONE <portal@k-one.cl>` y mandar mails a cualquier dirección (por ejemplo, una copia al proveedor).
- **Probar en tu computador:** instala Node 20 o superior, copia `.env.example` como `.env.local`, y corre `npm install` y luego `npm run dev`. Queda en http://localhost:3000.

## Costos estimados
- Vercel Hobby: $0 · Resend: $0 hasta 3.000 mails/mes · GitHub: $0
- OpenAI gpt-4o-mini: menos de US$1 al mes con este volumen. El chat tiene un límite de 40 preguntas por hora por usuario y respuestas cortas.

## Pendientes con Catálogo / TI antes de usarlo en serio
1. **Marca (columna N):** la lista de la plantilla solo trae ALPHABET, BLS y SHAQ. El portal escribe el nombre que ingresa la marca. Pide que creen las marcas de K-ONE o Bbook podría rechazar la columna.
2. **Comprador (BP):** confirma que tu nombre esté en la lista. Si no, agrégalo en `config/lists.js` cuando TI lo cree.
3. **Vendor Code (V):** el portal usa el código de estilo del proveedor. Confirma que eso es lo que espera Bbook.
4. **Plantilla:** confirma que "Marcas propias" es la plantilla correcta para marcas de terceros.
