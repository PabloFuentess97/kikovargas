# Email Templates

All emails sent via **Resend**. Base styling uses dark theme with gold accents to match landing design.

## Base Design

- **Background:** `#030303` (body), `#0f0f0f` (cards)
- **Text:** `#ededed` (primary), `#7a7a7a` (secondary)
- **Accent:** `#c9a84c` (gold for buttons, links)
- **Layout:** max-width 600px, centered
- **Font:** Inter/system stack for maximum client compatibility

## 1. Contact Form Notification

**Trigger:** POST `/api/contacts` (public form submission)
**Recipient:** Admin (`config.email.contactEmailTo` → `contacto@kikovargass.com`)
**Subject:** `Nuevo mensaje de contacto: {subject}`

**HTML structure:**
```html
<div style="max-width: 600px; margin: 0 auto; background: #0f0f0f; padding: 40px;">
  <h1 style="color: #c9a84c; font-size: 24px;">Nuevo mensaje recibido</h1>

  <table style="width: 100%; margin-top: 24px;">
    <tr>
      <td style="color: #7a7a7a; padding: 8px 0;">Nombre</td>
      <td style="color: #ededed;">{name}</td>
    </tr>
    <tr>
      <td>Email</td>
      <td><a href="mailto:{email}" style="color: #c9a84c;">{email}</a></td>
    </tr>
    <tr>
      <td>Teléfono</td>
      <td>{phone || "—"}</td>
    </tr>
    <tr>
      <td>Asunto</td>
      <td>{subject}</td>
    </tr>
  </table>

  <div style="margin-top: 24px; padding: 20px; background: #030303; border-left: 3px solid #c9a84c;">
    <p style="color: #ededed; white-space: pre-wrap;">{message}</p>
  </div>

  <a href="{APP_URL}/dashboard/contacts/{id}"
     style="display: inline-block; margin-top: 24px; padding: 12px 24px;
            background: #c9a84c; color: #030303; text-decoration: none;
            border-radius: 8px; font-weight: 600;">
    Ver en el panel
  </a>
</div>
```

## 2. Newsletter — Welcome

**Trigger:** POST `/api/newsletter/subscribe`
**Recipient:** New subscriber
**Subject:** `Bienvenido a la newsletter de Kiko Vargas`

**Content:**
```html
<h2 style="color: #c9a84c; font-family: Oswald, sans-serif; text-transform: uppercase;">
  Bienvenido
</h2>

<p style="color: #ededed;">Hola {name},</p>

<p style="color: #7a7a7a;">
  Gracias por suscribirte. Te enviaré artículos, consejos de entrenamiento,
  nutrición y novedades directamente a tu bandeja de entrada.
</p>

<p style="color: #7a7a7a;">
  Sin spam, solo valor. Si en algún momento quieres darte de baja, puedes
  hacerlo con un solo clic al final de cualquier email.
</p>

<p style="color: #ededed;">Nos vemos pronto.</p>

<p style="color: #c9a84c; font-weight: 600;">Kiko Vargas</p>

<hr style="border-color: rgba(255,255,255,0.08); margin: 32px 0;" />

<p style="color: #3d3d3d; font-size: 12px; text-align: center;">
  <a href="{APP_URL}/api/newsletter/unsubscribe?email={email}" style="color: #3d3d3d;">
    Darse de baja
  </a>
</p>
```

## 3. Newsletter — New Post Campaign

**Trigger:** POST `/api/newsletter/campaigns` with `template: "new_post"`
**Recipient:** All active subscribers
**Subject:** `Nuevo artículo: {post.title}`

**Content:**
```html
<!-- Cover image -->
<img src="{cover.url}" alt="{cover.alt}"
     style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px;" />

<h1 style="color: #ededed; font-family: Oswald, sans-serif;
           text-transform: uppercase; font-size: 32px; line-height: 1.1;
           margin-top: 24px;">
  {post.title}
</h1>

<p style="color: #7a7a7a; font-size: 16px; line-height: 1.7;">
  {post.excerpt}
</p>

<a href="{APP_URL}/blog/{post.slug}"
   style="display: inline-block; margin-top: 24px; padding: 14px 28px;
          background: #c9a84c; color: #030303; text-decoration: none;
          border-radius: 0; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.1em; font-size: 12px;">
  Leer artículo
</a>

<hr style="border-color: rgba(255,255,255,0.08); margin: 40px 0 24px;" />

<p style="color: #3d3d3d; font-size: 12px; text-align: center;">
  <a href="{APP_URL}/api/newsletter/unsubscribe?email={email}">
    Darse de baja
  </a>
</p>
```

## 4. Newsletter — Custom Campaign

**Trigger:** POST `/api/newsletter/campaigns` with `template: "custom"`
**Content:** Admin-provided HTML wrapped in base layout (same header/footer as other newsletters, same unsubscribe footer).

## 5. Booking Confirmation (to Client)

**Trigger:** POST `/api/bookings/public`
**Recipient:** Booking requester
**Subject:** `Reserva confirmada: {link.title}`

**Content:**
```html
<div style="text-align: center; margin-bottom: 32px;">
  <div style="display: inline-block; padding: 6px 16px;
              background: rgba(16, 185, 129, 0.1); color: #10b981;
              border-radius: 9999px; font-size: 12px; font-weight: 600;
              letter-spacing: 0.1em; text-transform: uppercase;">
    ✓ Confirmada
  </div>
</div>

<h2 style="color: #ededed; font-family: Oswald; text-transform: uppercase;">
  Tu reserva está confirmada
</h2>

<p style="color: #7a7a7a;">Hola {name},</p>

<p style="color: #7a7a7a;">
  He recibido tu reserva. Aquí tienes el resumen:
</p>

<div style="background: #030303; border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px; padding: 24px; margin: 24px 0;">
  <table style="width: 100%;">
    <tr>
      <td style="color: #3d3d3d; padding: 6px 0; font-size: 11px;
                 text-transform: uppercase; letter-spacing: 0.1em;">
        Servicio
      </td>
      <td style="color: #ededed; font-weight: 600;">{link.title}</td>
    </tr>
    <tr>
      <td>Fecha</td>
      <td>{formatDate(date, "EEEE d 'de' MMMM, yyyy")}</td>
    </tr>
    <tr>
      <td>Hora</td>
      <td>{formatTime(date, "HH:mm")}</td>
    </tr>
    <tr>
      <td>Duración</td>
      <td>{duration} minutos</td>
    </tr>
  </table>
</div>

{notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ""}

<p style="color: #7a7a7a;">
  Si necesitas modificar o cancelar la reserva, responde a este email
  o contáctame en <a href="mailto:{CONTACT_EMAIL}" style="color: #c9a84c;">{CONTACT_EMAIL}</a>.
</p>

<p style="color: #c9a84c; font-weight: 600;">Nos vemos pronto,<br/>Kiko Vargas</p>
```

## 6. Booking Notification (to Admin)

**Trigger:** POST `/api/bookings/public`
**Recipient:** Admin
**Subject:** `Nueva reserva: {name} ({link.title})`

**Content:**
```html
<div style="display: inline-block; padding: 6px 16px;
            background: rgba(201, 168, 76, 0.1); color: #c9a84c;
            border-radius: 9999px; font-size: 12px; font-weight: 600;">
  Nueva Reserva
</div>

<h2 style="color: #ededed;">Nueva reserva recibida</h2>

<table style="width: 100%; margin-top: 24px;">
  <tr><td>Cliente</td><td>{name}</td></tr>
  <tr><td>Email</td><td><a href="mailto:{email}">{email}</a></td></tr>
  <tr><td>Teléfono</td><td>{phone || "—"}</td></tr>
  <tr><td>Servicio</td><td>{link.title}</td></tr>
  <tr><td>Fecha</td><td>{formatDate(date, "EEEE d MMMM")}</td></tr>
  <tr><td>Hora</td><td>{formatTime(date, "HH:mm")}</td></tr>
  <tr><td>Duración</td><td>{duration} min</td></tr>
  <tr><td>Notas</td><td>{notes || "—"}</td></tr>
</table>

<a href="{APP_URL}/dashboard/bookings"
   style="display: inline-block; padding: 12px 24px; background: #c9a84c;
          color: #030303; text-decoration: none; border-radius: 8px;
          font-weight: 600; margin-top: 24px;">
  Ver en el panel
</a>
```

## 7. Event Lead Notification

**Trigger:** POST `/api/event-leads`
**Recipient:** Admin
**Subject:** `Nuevo lead: {page.title}`

**Content:**
```html
<h2 style="color: #ededed;">Nuevo lead registrado</h2>

<p style="color: #7a7a7a;">
  Landing: <strong style="color: #c9a84c;">{page.title}</strong>
</p>

<table style="width: 100%; margin-top: 16px;">
  <tr><td>Nombre</td><td>{name}</td></tr>
  <tr><td>Email</td><td>{email}</td></tr>
  <tr><td>Teléfono</td><td>{phone || "—"}</td></tr>
</table>

{message ? `
  <div style="margin-top: 16px; padding: 16px; background: #030303;
              border-left: 3px solid #c9a84c;">
    <p>${message}</p>
  </div>
` : ""}

<a href="{APP_URL}/dashboard/event-pages/{pageId}"
   style="...">
  Ver en el panel
</a>
```

## 8. Unsubscribe Page (GET /api/newsletter/unsubscribe)

Returns an HTML page confirming the unsubscribe:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Te has dado de baja</title>
  <style>
    body { background: #030303; color: #ededed; font-family: system-ui;
           display: flex; min-height: 100vh; align-items: center;
           justify-content: center; }
    .card { max-width: 440px; padding: 40px; text-align: center; }
    h1 { color: #c9a84c; font-size: 24px; text-transform: uppercase; }
    p { color: #7a7a7a; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Baja confirmada</h1>
    <p>Ya no recibirás más emails de la newsletter.</p>
    <p style="font-size: 12px; color: #3d3d3d;">
      Si cambias de opinión, puedes volver a suscribirte en cualquier momento.
    </p>
  </div>
</body>
</html>
```

## Sender Configuration (per email)

```typescript
from: `${config.email.fromName} <${config.email.fromEmail}>`
// Default: "Kiko Vargas Web <noreply@kikovargass.com>"
// Fallback: "onboarding@resend.dev" (Resend sandbox domain)
```
