# 09 · Sistema de email

## Proveedor

**Resend** (https://resend.com) — API REST transaccional.

- **Plan gratuito:** 100 emails/día, 3.000/mes
- **SDK oficial:** `resend@6.11.0` en `package.json`
- **Dominio:** puede usarse `onboarding@resend.dev` para pruebas o un dominio verificado

## Configuración dinámica

La API key vive en DB (`SiteConfig.email.resendApiKey`), cifrada con AES-256-GCM. Hay fallback a `process.env.RESEND_API_KEY`.

Estructura:
```typescript
interface EmailConfig {
  resendApiKey: string;     // cifrado en DB
  fromName: string;         // "Kiko Vargas Web"
  fromEmail: string;        // "noreply@kikovargass.com"
  contactEmailTo: string;   // destino de notificaciones → "contacto@kikovargass.com"
}
```

## Cliente Resend singleton

**Archivo:** `src/lib/email/resend.ts` (conceptual)

```typescript
import { Resend } from "resend";
import { getLandingConfig } from "@/lib/config/get-config";

let _client: Resend | null = null;
let _cachedKey: string | null = null;

export async function getResendClient(): Promise<Resend | null> {
  const config = await getLandingConfig();
  const apiKey = config.email.resendApiKey || process.env.RESEND_API_KEY;

  if (!apiKey) return null;

  // Cache simple: solo crea instancia nueva si la key cambió
  if (_client && _cachedKey === apiKey) return _client;

  _client = new Resend(apiKey);
  _cachedKey = apiKey;
  return _client;
}

export async function sendEmail({ to, subject, html }: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const client = await getResendClient();
  if (!client) {
    console.error("No Resend API key configured; email not sent");
    return { success: false, error: "No API key" };
  }

  const config = await getLandingConfig();
  const from = `${config.email.fromName} <${config.email.fromEmail}>`;

  try {
    const result = await client.emails.send({ from, to, subject, html });
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("Resend error:", err);
    return { success: false, error: (err as Error).message };
  }
}
```

**Propiedades:**
- Nunca lanza al caller (siempre retorna objeto).
- Cachea el cliente mientras la key no cambie.
- Email se construye de `fromName <fromEmail>` desde config.

## Disparadores de email

### 1. Notificación de formulario de contacto

**Trigger:** `POST /api/contacts` (público).
**Destinatario:** `config.email.contactEmailTo` (admin).
**Subject:** `"Nuevo mensaje de contacto: {subject}"`

**Flujo:**
```typescript
// En el handler POST /api/contacts
await prisma.contact.create({ ... });

// Fire-and-forget
sendContactNotification(contactData).catch(err =>
  console.error("Failed to send contact notification:", err)
);

return success({ id: contact.id }, 201);
```

**Template:** HTML con tabla (nombre, email, teléfono, asunto) + bloque con mensaje + botón "Ver en el panel".

### 2. Confirmación de reserva al cliente

**Trigger:** `POST /api/bookings/public` (público).
**Destinatario:** email introducido por el cliente.
**Subject:** `"Reserva confirmada: {link.title}"`

**Template:** badge verde "Confirmada", tabla con fecha/hora/duración/servicio, notas opcionales, footer con contacto.

### 3. Notificación de reserva al admin

**Trigger:** mismo evento que arriba.
**Destinatario:** `config.email.contactEmailTo`.
**Subject:** `"Nueva reserva: {name} ({link.title})"`

### 4. Welcome email del newsletter

**Trigger:** `POST /api/newsletter/subscribe`.
**Destinatario:** nuevo subscriber.
**Subject:** `"Bienvenido a la newsletter de Kiko Vargas"`

**Template:** saludo personalizado con `{name}`, breve mensaje, enlace de unsubscribe al pie.

### 5. Notificación de lead de event page

**Trigger:** `POST /api/event-leads`.
**Destinatario:** `config.email.contactEmailTo`.
**Subject:** `"Nuevo lead: {page.title}"`

### 6. Newsletter — post publicado

**Trigger:** `POST /api/newsletter/campaigns` con `template: "new_post"` y `send: true`.
**Destinatarios:** todos los `Subscriber` con `active: true`.
**Subject:** `"Nuevo articulo: {post.title}"`

**Template:** cover image + título + excerpt + botón "Leer artículo" → URL pública.

### 7. Newsletter — campaña custom

**Trigger:** `POST /api/newsletter/campaigns` con `template: "custom"`.
**Content:** HTML provisto por el admin, envuelto en layout base con header + footer unsubscribe.

### 8. Página de unsubscribe

**No es un email.** `GET /api/newsletter/unsubscribe?email=...` renderiza HTML directamente (no JSON):

```html
<html>
<head><title>Te has dado de baja</title></head>
<body style="background:#030303;color:#ededed;font-family:system-ui;display:flex;min-height:100vh;align-items:center;justify-content:center">
  <div style="max-width:440px;padding:40px;text-align:center">
    <h1 style="color:#c9a84c;font-size:24px;text-transform:uppercase">Baja confirmada</h1>
    <p style="color:#7a7a7a">Ya no recibirás más emails de la newsletter.</p>
  </div>
</body>
</html>
```

Y actualiza `Subscriber.active = false` + `unsubscribedAt = now()`.

## Templates — estructura común

Todos los emails siguen este layout base:

- **Fondo:** `#030303`
- **Contenedor card:** max 600px, `#0f0f0f`
- **Color primario:** `#ededed` (texto)
- **Color secundario:** `#7a7a7a` (texto suave)
- **Accent:** `#c9a84c` (gold)
- **Font stack:** `-apple-system, BlinkMacSystemFont, system-ui, sans-serif`
- **Unsubscribe footer:** solo en emails del newsletter (obligatorio legal RGPD)

Ejemplo de header:
```html
<div style="max-width:600px;margin:0 auto;background:#0f0f0f;padding:40px;font-family:system-ui,sans-serif;color:#ededed">
  <h1 style="color:#c9a84c;font-size:24px;font-weight:700;text-transform:uppercase;letter-spacing:-0.01em">
    {HEADING}
  </h1>
  <!-- contenido -->
  <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:40px 0 24px" />
  <p style="color:#3d3d3d;font-size:12px;text-align:center">
    <a href="{APP_URL}/api/newsletter/unsubscribe?email={email}" style="color:#3d3d3d">Darse de baja</a>
  </p>
</div>
```

## Envío masivo (campañas)

**Función:** `sendBatch(emails: string[], subject: string, htmlFn: (email) => string)` en `src/lib/email/resend.ts`.

```typescript
export async function sendBatch(
  emails: string[],
  subject: string,
  htmlFn: (email: string) => string
): Promise<{ sent: number; failed: number }> {
  const client = await getResendClient();
  if (!client) return { sent: 0, failed: emails.length };

  const config = await getLandingConfig();
  const from = `${config.email.fromName} <${config.email.fromEmail}>`;

  const BATCH_SIZE = 100;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      chunk.map(email =>
        client.emails.send({
          from, to: email, subject,
          html: htmlFn(email)
        })
      )
    );
    for (const r of results) {
      if (r.status === "fulfilled") sent++;
      else failed++;
    }
  }

  return { sent, failed };
}
```

**Propiedades:**
- Chunks de 100 (límite de Resend en `batch`, aunque aquí lo hacemos uno a uno con Promise.allSettled).
- `Promise.allSettled`: ningún email fallido aborta el resto.
- Devuelve count de éxito/fallo.

**Uso en campañas:**
```typescript
// POST /api/newsletter/campaigns
const subscribers = await prisma.subscriber.findMany({ where: { active: true } });

const htmlFn = template === "new_post"
  ? (email) => newPostTemplate(post, email)
  : (email) => customTemplate(content, email);

const { sent, failed } = await sendBatch(
  subscribers.map(s => s.email),
  subject,
  htmlFn
);

await prisma.campaign.update({
  where: { id: campaign.id },
  data: { status: "SENT", sentAt: new Date(), sentCount: sent }
});
```

## Dominio verificado

Para envíos desde dominio propio (no `onboarding@resend.dev`):

1. Resend dashboard → Domains → Add Domain
2. Registrar DNS:
   - `TXT` para SPF
   - `CNAME` para DKIM
   - `CNAME` para click/open tracking (opcional)
   - `MX` para bounces
3. Esperar verificación (~5-60 min)
4. Actualizar `config.email.fromEmail` al dominio verificado

Sin dominio verificado: los emails llegan, pero desde `onboarding@resend.dev`. Son propensos a ir a spam y la imagen es poco profesional.

## Testing

### En desarrollo

Configurar `RESEND_API_KEY` en `.env` y probar con tu propio email.

O usar un servicio de mocks como MailHog local (con un SMTP transport alternativo).

### En producción

Resend Dashboard muestra:
- Emails enviados
- Bounces
- Complaints
- Rate de apertura (si tracking activado)

Monitorear especialmente bounces (>5% = problema de reputación).

## Límites y consideraciones

- **3.000 emails/mes en plan gratuito.** Si se superan, se requiere upgrade.
- **100 emails/día** — newsletter a lista grande puede requerir scheduling.
- **Sin reintentos automáticos:** si Resend retorna 5xx, la campaña reporta failed y queda así. Mejora pendiente.
- **Sin tracking de apertura por usuario:** solo agregados en dashboard.
- **Fire-and-forget** para todos los emails transaccionales (no bloquean respuesta al usuario).
