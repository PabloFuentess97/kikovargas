# 11 · Sistema de reservas

## Modelos

- `BookingLink` — "servicio reservable" con slug, duration, expiresAt
- `Booking` — reserva individual asociada a un link
- `Availability` — disponibilidad semanal (1 fila por día, `dayOfWeek` 0-6 unique)

Ver `03-database.md`.

## Flujo público

```
Cliente abre /book/{slug}
  ↓
Server Component fetchea el BookingLink
  ↓
Client Component (multi-step):

  Step 1: Calendar
    ↓ Click en un día con availability
    ↓ GET /api/bookings/public?slug=X&date=YYYY-MM-DD
    ↓ Recibe availability + bookedSlots

  Step 2: Time picker
    ↓ Calcula slots libres: (endTime - startTime) / duration, excluyendo bookedSlots
    ↓ Click en un slot
    ↓
  Step 3: Form (name, email, phone, notes)
    ↓ Submit
    ↓ POST /api/bookings/public
    ↓ Si 409: vuelve a Step 2 con data fresca
    ↓ Si 200:
    ↓
  Step 4: Success (confirmación)
    + Email al cliente
    + Email al admin
    + Contact creado en CRM
```

## Endpoint `/api/bookings/public`

### GET — obtener availability para una fecha

```typescript
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("slug");
  const dateStr = searchParams.get("date");  // YYYY-MM-DD

  if (!slug || !dateStr) return error("Missing params", 400);

  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return error("Invalid date", 400);

  // 1. Fetch link
  const link = await prisma.bookingLink.findUnique({ where: { slug } });
  if (!link) return error("Link not found", 404);
  if (!link.active) return error("Link inactive", 404);
  if (link.expiresAt && link.expiresAt < new Date()) return error("Link expired", 410);

  // 2. Fetch availability para el día de la semana
  const dayOfWeek = date.getDay();  // 0 domingo ... 6 sábado
  const availability = await prisma.availability.findUnique({
    where: { dayOfWeek }
  });

  if (!availability || !availability.active) {
    return success({
      link: { title: link.title, description: link.description, duration: link.duration },
      availability: null,
      bookedSlots: []
    });
  }

  // 3. Fetch bookings existentes para esa fecha
  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      linkId: link.id,
      status: { not: "CANCELLED" },
      date: { gte: dayStart, lt: dayEnd }
    },
    select: { date: true }
  });

  // 4. Formatear slots ocupados como "HH:mm"
  const bookedSlots = bookings.map(b => {
    const h = b.date.getHours().toString().padStart(2, "0");
    const m = b.date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  });

  return success({
    link: {
      title: link.title,
      description: link.description,
      duration: link.duration
    },
    availability: {
      startTime: availability.startTime,
      endTime: availability.endTime
    },
    bookedSlots
  });
}
```

### POST — crear reserva

```typescript
const BookingSchema = z.object({
  slug: z.string(),
  date: z.string().datetime(),  // ISO 8601
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  notes: z.string().max(500).optional()
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const { slug, date: dateStr, name, email, phone = "", notes = "" } = parsed.data;
  const date = new Date(dateStr);

  // 1. Link checks
  const link = await prisma.bookingLink.findUnique({ where: { slug } });
  if (!link || !link.active) return error("Link not available", 404);
  if (link.expiresAt && link.expiresAt < new Date()) return error("Link expired", 410);

  // 2. Availability checks
  const dayOfWeek = date.getDay();
  const availability = await prisma.availability.findUnique({ where: { dayOfWeek } });
  if (!availability || !availability.active) {
    return error("No availability for this day", 422);
  }

  // Hora dentro del rango
  const hour = date.getHours();
  const minute = date.getMinutes();
  const slotTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

  if (slotTime < availability.startTime || slotTime >= availability.endTime) {
    return error("Time outside availability window", 422);
  }

  // 3. Conflict check (no overlap)
  const slotEnd = new Date(date.getTime() + link.duration * 60000);

  const conflicts = await prisma.booking.findMany({
    where: {
      linkId: link.id,
      status: { not: "CANCELLED" },
      OR: [
        // nueva reserva empieza durante otra existente
        { date: { gte: date, lt: slotEnd } },
        // nueva reserva solapa el inicio de otra
        { AND: [{ date: { lt: date } }, { date: { gte: new Date(date.getTime() - link.duration * 60000) } }] }
      ]
    }
  });

  if (conflicts.length > 0) return error("Slot already booked", 409);

  // 4. Crear Booking
  const booking = await prisma.booking.create({
    data: {
      linkId: link.id,
      date,
      duration: link.duration,
      name,
      email,
      phone,
      notes,
      status: "CONFIRMED"
    }
  });

  // 5. Side effects (fire-and-forget)
  createContactFromBooking(booking).catch(console.error);
  sendUserConfirmation(booking, link).catch(console.error);
  sendAdminNotification(booking, link).catch(console.error);

  return success({
    id: booking.id,
    date: booking.date,
    duration: booking.duration,
    status: booking.status
  }, 201);
}
```

## Enlaces de reserva

### Unicidad de slug

`BookingLink.slug` es `@unique` en DB. Colisión al crear retorna 409.

Al crear desde admin (`POST /api/booking-links`), el servidor verifica explícitamente con mensaje user-friendly:
```typescript
const existing = await prisma.bookingLink.findUnique({ where: { slug } });
if (existing) return error("Ya existe un enlace con ese slug", 409);
```

### Validación del slug

```typescript
slug: z.string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido")
```

Solo lowercase + números + guiones. No espacios, no símbolos.

## Disponibilidad

### Modelo

Una fila por día de la semana. Máximo 7 filas.

```typescript
{
  id: string,
  dayOfWeek: 0-6,           // @@unique
  startTime: "HH:mm",       // string, ej "15:00"
  endTime: "HH:mm",         // ej "21:00"
  active: boolean
}
```

### PUT `/api/availability` — reemplazo atómico

```typescript
const SlotsSchema = z.object({
  slots: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    active: z.boolean()
  })).max(7)
});

export async function PUT(req: NextRequest) {
  await requireAdmin();
  const parsed = SlotsSchema.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  // Validar startTime < endTime
  for (const slot of parsed.data.slots) {
    if (slot.startTime >= slot.endTime) {
      return error(`Día ${slot.dayOfWeek}: startTime debe ser anterior a endTime`, 422);
    }
  }

  // Transacción: delete all + create all
  await prisma.$transaction([
    prisma.availability.deleteMany(),
    prisma.availability.createMany({ data: parsed.data.slots })
  ]);

  return success({ updated: true });
}
```

**Estrategia deliberada:** reemplazo completo en lugar de CRUD individual. Simplifica:
- No hay que trackear qué slot se borró vs. modificó vs. creó.
- La UI envía siempre el estado completo.
- Transacción garantiza consistencia.

### Presets UI

Tres presets hardcoded en el cliente:
- "Lunes-Viernes 15:00-21:00"
- "Fines de semana 10:00-14:00"
- "Todos los días 9:00-18:00"

Solo modifican el state local; el admin debe pulsar "Guardar" para persistir.

## Timezone

**Simplificación deliberada:** todas las fechas se almacenan como `DateTime` en UTC, pero los `startTime`/`endTime` de availability son **strings en hora local del servidor**.

Esto significa:
- El servidor debe estar en la timezone correcta (ej. `TZ=Europe/Madrid` en Docker).
- No hay soporte para múltiples timezones del usuario.
- Si el cliente reserva desde otra timezone, la hora se interpreta localmente — puede haber confusión.

**Mejora futura:** almacenar timezone del negocio en config y convertir explícitamente.

## Email de confirmación

### Usuario (cliente)

**Subject:** `Reserva confirmada: {link.title}`
**From:** `{fromName} <{fromEmail}>`

Template (resumen):
```html
<div class="cover-body">
  <div class="badge-success">✓ Confirmada</div>
  <h1>Tu reserva está confirmada</h1>
  <p>Hola {name},</p>
  <p>He recibido tu reserva. Aquí tienes el resumen:</p>
  <table>
    <tr><td>Servicio</td><td>{link.title}</td></tr>
    <tr><td>Fecha</td><td>{formatDate(date)}</td></tr>
    <tr><td>Hora</td><td>{formatTime(date)}</td></tr>
    <tr><td>Duración</td><td>{duration} min</td></tr>
  </table>
  {notes && <p><strong>Notas:</strong> {notes}</p>}
  <p>Si necesitas modificar/cancelar, contáctame en {contactEmail}.</p>
  <p>Kiko Vargas</p>
</div>
```

### Admin

**Subject:** `Nueva reserva: {name} ({link.title})`

Template:
```html
<div class="badge-accent">Nueva Reserva</div>
<h2>Nueva reserva recibida</h2>
<table>
  <tr><td>Cliente</td><td>{name}</td></tr>
  <tr><td>Email</td><td><a href="mailto:{email}">{email}</a></td></tr>
  <tr><td>Teléfono</td><td>{phone || "—"}</td></tr>
  <tr><td>Servicio</td><td>{link.title}</td></tr>
  <tr><td>Fecha</td><td>{formatDate(date)}</td></tr>
  <tr><td>Hora</td><td>{formatTime(date)}</td></tr>
  <tr><td>Notas</td><td>{notes || "—"}</td></tr>
</table>
<a href="{APP_URL}/dashboard/bookings" class="button">Ver en el panel</a>
```

## Cancelación / modificación

**No hay endpoint público de cancelación.** El cliente debe contactar por email al admin, quien desde `/dashboard/bookings` puede:
- Cambiar estado a `CANCELLED` → el slot se libera inmediatamente.
- Eliminar la reserva.

**Mejora futura:** enlace público en el email de confirmación para que el cliente pueda cancelar (con token único).

## Expiración de links

`BookingLink.expiresAt` es un `DateTime?`.

Si está set y es pasado:
- `GET /api/bookings/public?slug=...` retorna 410 Gone.
- `POST /api/bookings/public` retorna 410 Gone.

**No hay cron job** que desactive links expirados. La UI admin muestra "Expirado" cuando el campo está en el pasado.

## Casos límite conocidos

1. **Concurrencia de booking al mismo slot.** Dos clientes intentan reservar las 17:00 del martes al mismo tiempo. Solo uno gana.
   - **Solución actual:** race condition real. El segundo recibe 409. Aceptable para el volumen esperado.
   - **Mejora futura:** `SELECT ... FOR UPDATE` o lock distribuido.

2. **Cambio de disponibilidad con reservas ya hechas.** Admin desactiva el martes, pero ya hay reservas en ese día.
   - **Actual:** las reservas existentes no se cancelan. Solo se bloquean NUEVAS reservas.
   - Esto es correcto UX: el admin debe gestionar manualmente las reservas ya aceptadas.

3. **Cambio de duration del link.** Si el link tenía 60min y se cambia a 30min:
   - Las reservas viejas mantienen `Booking.duration` = 60 (snapshot).
   - Solo reservas nuevas usan la nueva duration.

4. **Timezone del servidor cambia.** Catastrófico. Todas las fechas se reinterpretan.
   - **Mitigar:** fijar `TZ` en Docker, no cambiarla.
