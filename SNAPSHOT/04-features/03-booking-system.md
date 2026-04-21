# Feature — Booking System

## Overview

A self-service appointment booking system that allows clients to book time slots via public booking links without needing to message the admin.

**Three components:**
1. **Booking Links** — Unique slugs for each bookable service
2. **Availability** — Weekly recurring hours when bookings are accepted
3. **Bookings** — Individual confirmed appointments

## Public Flow

```
Client visits /book/{slug}
  ↓
Sees a calendar (only days with availability are clickable)
  ↓
Picks a day → sees available time slots (respecting existing bookings)
  ↓
Picks a time → fills form (name, email, phone, notes)
  ↓
Submits
  ↓
System validates, creates booking (PENDING → CONFIRMED)
  ↓
Sends confirmation email to client
Sends notification email to admin
```

## Data Models

### BookingLink
```typescript
{
  id: string,
  slug: string (unique, e.g. "consulta"),
  title: string (default "Reserva tu cita"),
  description: string,
  duration: number (15-480 minutes, default 60),
  active: boolean (default true),
  expiresAt: Date | null,
  bookings: Booking[] (relation)
}
```

### Booking
```typescript
{
  id: string,
  date: DateTime,           // Start date/time
  duration: number,         // Minutes (snapshot from link)
  name: string,
  email: string,
  phone: string,
  notes: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED" (default CONFIRMED),
  linkId: FK → BookingLink (cascade on delete)
}
```

### Availability
```typescript
{
  id: string,
  dayOfWeek: number (0=Sunday, 1=Monday, ..., 6=Saturday) (unique),
  startTime: string ("HH:mm"),
  endTime: string ("HH:mm"),
  active: boolean
}
```

## Admin Flow

### 1. Configure availability (`/dashboard/availability`)

UI shows 7 rows (one per day):
```
Domingo    [toggle] [start time] [end time]
Lunes      [toggle] [start time] [end time]
...
Sábado     [toggle] [start time] [end time]
```

**Preset buttons:**
- "Lunes a Viernes (15:00–21:00)"
- "Fines de semana (10:00–14:00)"
- "Todos los días (09:00–18:00)"

**Save → `PUT /api/availability`** replaces ALL records atomically (in transaction).

### 2. Create a booking link (`/dashboard/booking-links`)

Fields:
- `slug` — e.g., `consulta` → URL becomes `/book/consulta`
- `title` — Public display name
- `description` — Explanation shown on booking page
- `duration` — Minutes per session
- `expiresAt` — Optional date after which link auto-disables
- `active` — On/off toggle

Actions: Copy URL, Toggle active, Delete (cascades bookings).

### 3. Monitor bookings (`/dashboard/bookings`)

Table with columns: Client, Date/Time, Service, Status, Actions.
Filters by status (All, Confirmed, Pending, Cancelled).
Actions: Cancel, Reactivate, Delete.

## Public API

### GET `/api/bookings/public?slug={slug}&date=2026-05-15`

Returns available slots for a date:
```json
{
  "success": true,
  "data": {
    "link": {
      "title": "Consulta de nutrición",
      "description": "...",
      "duration": 60
    },
    "availability": {
      "startTime": "15:00",
      "endTime": "21:00"
    },
    "bookedSlots": ["16:00", "17:00"]  // Already booked times
  }
}
```

Frontend calculates free slots by:
1. Generating times from `startTime` to `endTime` in `duration` increments
2. Filtering out `bookedSlots`

### POST `/api/bookings/public`

```http
POST /api/bookings/public
Content-Type: application/json

{
  "slug": "consulta",
  "date": "2026-05-15T16:00:00.000Z",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+34 666 123 456",
  "notes": "Primera consulta"
}
```

**Validation performed server-side:**
1. Booking link exists, active, not expired
2. Day of week has availability configured and active
3. Time falls within `startTime`–`endTime`
4. No existing booking conflicts with the same slot
5. Name, email are valid

**Side effects:**
1. Creates `Booking` record (status: CONFIRMED)
2. Creates `Contact` record (fire-and-forget) with `source: "booking"`
3. Sends confirmation email to client
4. Sends notification email to admin

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ckm3k5n6p7...",
    "date": "2026-05-15T16:00:00.000Z",
    "duration": 60,
    "status": "CONFIRMED"
  }
}
```

## Conflict Prevention

On booking creation, the server checks:
```sql
SELECT * FROM bookings
WHERE link_id = ?
  AND status != 'CANCELLED'
  AND (
    (date >= newStart AND date < newEnd)
    OR
    (date < newStart AND (date + duration * interval '1 minute') > newStart)
  )
```

If any row found → returns 409 Conflict with "Slot already booked".

## Email Notifications

Both client and admin receive an email. See `SNAPSHOT/02-content/03-email-templates.md`.

**Client email:**
- Subject: "Reserva confirmada: {title}"
- Includes: date, time, duration, notes, contact email
- Confirmation badge at top

**Admin email:**
- Subject: "Nueva reserva: {name} ({title})"
- Includes: client details, date/time
- Link to `/dashboard/bookings`

## Admin API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/booking-links` | List all links |
| POST | `/api/booking-links` | Create link |
| PATCH | `/api/booking-links/:id` | Update |
| DELETE | `/api/booking-links/:id` | Delete (cascades) |
| GET | `/api/bookings` | List all bookings |
| PATCH | `/api/bookings/:id` | Update status/notes |
| DELETE | `/api/bookings/:id` | Delete |
| GET | `/api/availability` | Public — get schedule |
| PUT | `/api/availability` | Admin — replace schedule |

## Timezones

- All `date` values stored as UTC
- Client side: displays in browser's timezone
- Admin side: displays in browser's timezone
- Availability `startTime`/`endTime`: interpreted as server local time
- **Recommendation:** Deploy with `TZ=Europe/Madrid` or similar to match expected locale

## UI on Booking Page (`/book/{slug}`)

Built with:
- React calendar component (highlights available days)
- Time slot grid (24h format)
- Form with validation
- Success state with booking details

## Expiry Logic

If `booking_link.expiresAt` is set and past:
- Public page returns 410 Gone or similar
- Admin UI shows the link as "Expired"
- Link stays in the system for record-keeping
