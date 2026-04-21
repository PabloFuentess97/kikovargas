# Prompt — Build Booking System

## Context for LLM

```
Create the complete booking system: admin management + public booking flow.

**API Routes:**

**1. src/app/api/booking-links/route.ts**
- GET: list all links with booking count
- POST: create link
  Schema: { slug (2-100, lowercase-hyphens), title? (max 200), description? (max 1000),
    duration? (15-480), active?, expiresAt? (ISO) }

**2. src/app/api/booking-links/[id]/route.ts**
- GET, PATCH, DELETE

**3. src/app/api/availability/route.ts**
- GET: public. Returns all 7 availability records.
- PUT: admin. Replace all.
  Schema: { slots: [{ dayOfWeek (0-6), startTime (HH:mm), endTime (HH:mm), active }] }
  Use Prisma transaction: delete all, then create new.
  Validate startTime < endTime.

**4. src/app/api/bookings/route.ts**
- GET: admin. List last 200 bookings with link info.

**5. src/app/api/bookings/[id]/route.ts**
- PATCH: update status (PENDING/CONFIRMED/CANCELLED) or notes
- DELETE

**6. src/app/api/bookings/public/route.ts** (public!)

GET with query params (slug, date YYYY-MM-DD):
- Fetch booking link by slug; return 404 if missing/inactive/expired
- Get availability for new Date(date).getDay()
- Get booked slots for that date (bookings with status != CANCELLED)
- Return { link: {title, description, duration}, availability: {startTime, endTime}|null,
    bookedSlots: ["HH:mm"] }

POST to create booking:
Schema: { slug, date (ISO datetime), name (2-100), email (email), phone? (max 30),
  notes? (max 500) }

Validations:
1. Link exists, active, not expired
2. dayOfWeek of date has availability, active
3. Time falls within startTime-endTime
4. No existing booking overlaps (check date + duration range)

Side effects (fire-and-forget):
- Create Contact record with source="booking"
- Send confirmation email to client
- Send notification email to admin

Return { id, date, duration, status: "CONFIRMED" }. Status 409 if conflict.

**Admin Pages:**

**1. /dashboard/booking-links/page.tsx + booking-link-list.tsx (client)**
- Table: Title, Slug (click to copy), Duration, Active toggle, Bookings count, Actions
- "+ Nuevo enlace" inline form:
  slug, title, description, duration, expiresAt
- Actions per row: Copy link, Toggle active, Delete (confirm)

**2. /dashboard/availability/page.tsx + availability-editor.tsx (client)**
- 7 day rows (Sunday → Saturday)
- Each row: toggle, start time input (type=time), end time input
- Preset buttons:
  - "Lunes a Viernes (15:00-21:00)"
  - "Fines de semana (10:00-14:00)"
  - "Todos los dias (09:00-18:00)"
- Save button → PUT /api/availability with all 7 slots

**3. /dashboard/bookings/page.tsx + booking-list.tsx (client)**
- Filter tabs: All, Confirmed, Pending, Cancelled
- Table: Client (name/email), Date/Time, Duration, Service, Status, Actions
- Actions: Change status (dropdown), Delete

**Public Booking Page:**

**1. src/app/book/[slug]/page.tsx**

Server component:
- Fetch booking link by slug; 404 if not found
- If inactive or expired, show "Enlace no disponible" message
- Otherwise render <BookingPublicClient slug={slug} linkData={link} />

**2. src/app/book/[slug]/booking-public-client.tsx (client)**

State: step (1=pick date, 2=pick time, 3=form, 4=success)

Step 1 — Calendar:
- React calendar component
- Only days with availability are clickable (other days gray out)
- On click: fetch GET /api/bookings/public?slug=&date= → set selected date, go step 2

Step 2 — Time picker:
- Generate slots from startTime to endTime in `duration` increments
- Filter out `bookedSlots`
- Show available times as buttons
- On click: set selected time, go step 3

Step 3 — Form:
- Inputs: name, email, phone, notes
- Submit: POST /api/bookings/public
- On success: show step 4
- On 409 error: go back to step 2 with fresh data

Step 4 — Success:
- "Reserva confirmada" with details
- "Revisa tu email para el resumen"

Styled with landing theme tokens (uses bg-void, accent, etc.).

**Emails:**

**1. src/lib/email/booking.ts**
- userConfirmationHtml({ booking, link, config }): returns HTML string
- adminNotificationHtml({ booking, link, config }): returns HTML string

See SNAPSHOT/02-content/03-email-templates.md for exact HTML structure.

**2. src/lib/email/resend.ts**
- getResendClient(): returns Resend instance with API key from DB config or env
- sendEmail({ to, subject, html }): wrapper that handles errors gracefully
```

## Validation

1. **Admin:**
   - Navigate to `/dashboard/availability` → set Mon-Fri 15:00-21:00 → save
   - Navigate to `/dashboard/booking-links` → create link slug=consulta, duration=60

2. **Public:**
   - Visit `/book/consulta` → see calendar
   - Click a Wednesday → time slots appear (15:00, 16:00, ..., 20:00)
   - Pick 17:00 → fill form → submit
   - See success page
   - Check email inbox (both client and admin emails)

3. **Admin verify:**
   - Navigate to `/dashboard/bookings` → booking appears with status CONFIRMED
   - Navigate to `/dashboard/contacts` → contact record created from booking

4. **Conflict test:**
   - Try booking same slot again → 409 error, UI reloads available times
