# API — Request / Response Schemas

All schemas use Zod for validation (`src/lib/validations/`).

## Authentication

### POST /api/auth/login

**Request:**
```typescript
{
  email: string (email format),
  password: string (min 8 chars)
}
```

**Response (200):**
```typescript
{ success: true, data: { name: string, email: string, role: "ADMIN" | "USER" } }
// Sets httpOnly cookie "token" (8h expiration)
```

**Errors:**
- `400` — Invalid body
- `401` — Invalid credentials
- `403` — User inactive

### POST /api/auth/logout

No body. Clears cookie.
```typescript
{ success: true }
```

### GET /api/auth/me

```typescript
{ success: true, data: { id, email, name, role } }
```

## Posts

### POST /api/posts
```typescript
// createPostSchema
{
  title: string (1-200),
  slug: string (1-200, /^[a-z0-9]+(-[a-z0-9]+)*$/),
  excerpt?: string (max 500),
  content: string (min 1),
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" (default DRAFT),
  coverId?: string
}
```

Response: `{ success: true, data: Post }`

### PATCH /api/posts/:id
Partial of createPostSchema. Sets `publishedAt` when transitioning to PUBLISHED.

### GET /api/posts
Query: `?page=1&limit=10&status=PUBLISHED`

Response:
```typescript
{
  success: true,
  data: {
    posts: Post[],
    pagination: { page, limit, total, totalPages }
  }
}
```

## Contacts

### POST /api/contacts (Public)
```typescript
// createContactSchema
{
  name: string (1-100),
  email: string (email),
  phone?: string (max 20),
  subject: string (1-200),
  message: string (1-5000)
}
```

### PATCH /api/contacts/:id
```typescript
// updateContactStatusSchema
{ status: "PENDING" | "READ" | "REPLIED" | "ARCHIVED" }
```

## Images

### POST /api/images
```typescript
// createImageSchema
{
  url: string,
  key: string,
  alt?: string (max 300, default ""),
  width?: number (positive int),
  height?: number (positive int),
  size?: number (positive int),
  mime?: string (default "image/jpeg"),
  gallery?: boolean (default false),
  order?: number (min 0, default 0),
  postId?: string
}
```

### POST /api/upload
```typescript
// multipart/form-data with field "files"
// Max 10 files, 5MB each, types: image/jpeg, image/png, image/webp

Response: {
  success: true,
  data: {
    uploaded: [
      { url, key, width, height, size, mime }
    ],
    errors: [ { filename, message } ]
  }
}
```

## Newsletter

### POST /api/newsletter/subscribe (Public)
```typescript
{
  email: string (email),
  name?: string (max 100)
}
```

### GET /api/newsletter/campaigns
```typescript
Response: { success: true, data: Campaign[] }
```

### POST /api/newsletter/campaigns
```typescript
{
  subject: string (1-200),
  content: string (min 1),
  template?: "custom" | "new_post" (default "custom"),
  postId?: string,     // Required if template="new_post"
  send?: boolean       // If true, sends immediately
}

// Response includes sentCount if send=true
```

## Booking

### POST /api/bookings/public (Public)
```typescript
{
  slug: string,
  date: string (ISO 8601 datetime),
  name: string (2-100),
  email: string (email),
  phone?: string (max 30),
  notes?: string (max 500)
}

// Server validates:
// - Link exists, active, not expired
// - dayOfWeek has availability
// - Time within startTime-endTime
// - No conflict with existing bookings

Response: {
  success: true,
  data: { id, date, duration, status: "CONFIRMED" }
}

// Errors:
// 404 — Link not found or inactive
// 410 — Link expired
// 409 — Slot already booked
// 422 — Day/time outside availability
```

### GET /api/bookings/public?slug=X&date=YYYY-MM-DD
```typescript
Response: {
  success: true,
  data: {
    link: { title, description, duration },
    availability: { startTime: "HH:mm", endTime: "HH:mm" } | null,
    bookedSlots: ["16:00", "17:00"]
  }
}
```

### POST /api/booking-links
```typescript
{
  slug: string (2-100, lowercase-hyphens),
  title?: string (0-200),
  description?: string (0-1000),
  duration?: number (15-480),
  active?: boolean,
  expiresAt?: string | null (ISO)
}
```

### PUT /api/availability
```typescript
{
  slots: [
    {
      dayOfWeek: number (0-6),
      startTime: string ("HH:mm"),
      endTime: string ("HH:mm"),   // Must be > startTime
      active: boolean
    }
  ]
}

// Replaces all availability records in a transaction
```

## Event Pages

### POST /api/event-pages
```typescript
{
  slug: string (2-100, lowercase-hyphens),
  title: string (1-200),
  description?: string (0-1000),
  template?: "custom" | "webinar" | "fitness" | "coaching"
}
```

### POST /api/event-pages/:id/blocks

**Create block:**
```typescript
{
  type: "hero"|"text"|"image"|"cta"|"gallery"|"form"|"countdown"|"faq"|
        "testimonials"|"video"|"pricing"|"stats"|"divider"|"features",
  data: object       // Block-specific payload
}
```

**Reorder blocks:**
```typescript
{
  blockIds: string[]    // Array of block IDs in new order
}
```

### PATCH /api/event-pages/:id/blocks/:blockId
```typescript
{ data: object }    // Block-specific payload (replaces existing)
```

## Event Leads

### POST /api/event-leads (Public)
```typescript
{
  pageId: string,
  name: string (2-100),
  email: string (email),
  phone?: string (max 30),
  message?: string (max 500)
}

// Page must be PUBLISHED
// Triggers: create EventLead + Contact + admin email
```

## AI

### POST /api/ai/generate
```typescript
{
  topic: string (min 3),
  context?: string
}

Response: {
  success: true,
  data: { title: string, content: string }   // HTML
}
```

### POST /api/ai/generate-ideas
```typescript
{
  niche?: string,
  count?: number (1-10, default 5)
}

Response: {
  success: true,
  data: {
    ideas: [
      { title: string, description: string, tags: string[] }
    ]
  }
}
```

### POST /api/ai/generate-image
```typescript
{
  topic?: string,
  title?: string
  // At least one required
}

Response: {
  success: true,
  data: {
    imageId: string,
    url: string
  }
}
```

## Analytics

### POST /api/analytics/track (Public)
```typescript
{
  path: string (1-500),
  referrer?: string (max 1000)
}

// Server extracts: userAgent, IP, country, city, device, browser, OS
// Never fails (always returns 200 success)
```

### GET /api/analytics/stats
```typescript
Response: {
  success: true,
  data: {
    totalViews: number,
    todayViews: number,
    weekViews: number,
    monthViews: number,
    topPages: [ { path: string, count: number } ],    // Top 10
    topCountries: [ { country: string, count: number } ],  // Top 10
    devices: { desktop: number, mobile: number, tablet: number },
    browsers: { Chrome: N, Firefox: N, ... },
    dailyViews: [ { date: "YYYY-MM-DD", count: number } ]  // Last 30 days
  }
}
```

## Config

### GET /api/config
```typescript
Response: {
  success: true,
  data: LandingConfig   // All 10 sections, sensitive fields masked
}

// Example masked: "sk-a••••••xyz"
```

### PATCH /api/config
```typescript
{
  key: "theme"|"sections"|"hero"|"about"|"stats"|"contact"|
       "social"|"navbar"|"ai"|"email",
  value: object   // Section payload
}

// Preserves encrypted values if masked field unchanged
// Revalidates Next.js cache for landing page
```

## Knowledge Base

### PATCH /api/kb/articles/:id
```typescript
{
  title?: string,
  content?: string    // HTML
}

// At least one field required
```

### POST /api/kb/seed
No body. Returns:
```typescript
{
  success: true,
  data: {
    seeded: true,
    categoriesCreated: number,
    articlesCreated: number,
    message: string
  }
}
```
