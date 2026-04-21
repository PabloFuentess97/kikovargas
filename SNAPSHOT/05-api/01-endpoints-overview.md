# API — Endpoints Overview

All endpoints return the standard envelope:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }
```

Implemented via `src/lib/api-response.ts`:
```typescript
export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}
```

## Auth Requirements

- **Public** — No authentication required
- **Admin** — Requires `role: ADMIN` via `requireAdmin()` on JWT session

## Full Endpoint Matrix

### Authentication
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/login` | Public | Login with email/password, sets httpOnly cookie |
| POST | `/api/auth/logout` | Public | Clears session cookie |
| GET | `/api/auth/me` | Session | Get current user info |

### Users
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/users` | Admin | List all users (paginated) |

### Posts
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/posts` | Public* | List posts. Admin sees all statuses; public only PUBLISHED |
| POST | `/api/posts` | Admin | Create new post |
| GET | `/api/posts/:id` | Public* | Get by ID or slug. Public sees only PUBLISHED |
| PATCH | `/api/posts/:id` | Admin | Update post |
| DELETE | `/api/posts/:id` | Admin | Delete |

### Contacts
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/contacts` | Admin | List (paginated, status filter) |
| POST | `/api/contacts` | Public | Submit contact form → creates record + sends notification |
| GET | `/api/contacts/:id` | Admin | Get single; auto-marks READ on first view |
| PATCH | `/api/contacts/:id` | Admin | Update status |
| DELETE | `/api/contacts/:id` | Admin | Delete |

### Images & Gallery
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/images` | Admin | List images (optional `?gallery=true`) |
| POST | `/api/images` | Admin | Create image metadata record |
| PATCH | `/api/images/:id` | Admin | Update alt, order, gallery flag |
| DELETE | `/api/images/:id` | Admin | Delete record + file from disk |
| GET | `/api/gallery` | Public | List `gallery: true` images (for landing) |
| POST | `/api/upload` | Admin | Upload files (multipart), returns URLs |
| GET | `/api/uploads/:filepath` | Public | Serve uploaded file |

### Newsletter
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/newsletter/subscribe` | Public | Add/reactivate subscriber, send welcome email |
| GET | `/api/newsletter/unsubscribe?email=` | Public | Unsubscribe, returns HTML confirmation |
| GET | `/api/newsletter/subscribers` | Admin | List subscribers (paginated, status filter) |
| DELETE | `/api/newsletter/subscribers` | Admin | Delete subscriber by id |
| GET | `/api/newsletter/campaigns` | Admin | List last 50 campaigns |
| POST | `/api/newsletter/campaigns` | Admin | Create campaign; if `send=true`, sends to all |

### Booking
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/bookings` | Admin | List bookings (last 200) |
| PATCH | `/api/bookings/:id` | Admin | Update status/notes |
| DELETE | `/api/bookings/:id` | Admin | Delete |
| GET | `/api/bookings/public?slug=&date=` | Public | Get availability + booked slots for a date |
| POST | `/api/bookings/public` | Public | Create booking, send confirmations |

### Booking Links
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/booking-links` | Admin | List all |
| POST | `/api/booking-links` | Admin | Create |
| GET | `/api/booking-links/:id` | Admin | Get single |
| PATCH | `/api/booking-links/:id` | Admin | Update |
| DELETE | `/api/booking-links/:id` | Admin | Delete (cascades bookings) |

### Availability
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/availability` | Public | Get weekly schedule |
| PUT | `/api/availability` | Admin | Replace entire schedule (transactional) |

### Event Pages
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/event-pages` | Admin | List pages with block/lead counts |
| POST | `/api/event-pages` | Admin | Create |
| GET | `/api/event-pages/:id` | Admin | Get page with blocks |
| PATCH | `/api/event-pages/:id` | Admin | Update |
| DELETE | `/api/event-pages/:id` | Admin | Delete (cascades) |
| POST | `/api/event-pages/:id/blocks` | Admin | Add block OR reorder blocks |
| PATCH | `/api/event-pages/:id/blocks/:blockId` | Admin | Update block data |
| DELETE | `/api/event-pages/:id/blocks/:blockId` | Admin | Delete + reorder remaining |

### Event Leads
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/event-leads?pageId=` | Admin | List leads (filter by page) |
| POST | `/api/event-leads` | Public | Submit lead from event page |

### AI
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/ai/generate` | Admin | Generate article via OpenAI/Ollama |
| POST | `/api/ai/generate-ideas` | Admin | Generate blog post ideas |
| POST | `/api/ai/generate-image` | Admin | Generate cover with DALL-E 3 |

### Analytics
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/analytics/track` | Public | Log page view (never fails) |
| GET | `/api/analytics/stats` | Admin | Dashboard analytics data |

### Config
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/config` | Admin | Get all landing config (masked API keys) |
| PATCH | `/api/config` | Admin | Update one section, revalidate cache |

### Knowledge Base
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/kb/articles` | Admin | Get all categories + articles from DB |
| PATCH | `/api/kb/articles/:id` | Admin | Update title or content |
| POST | `/api/kb/seed` | Admin | Seed static content to DB (idempotent) |

## Totals

- **37 route files**
- **25 admin-only endpoints**
- **10 public endpoints** (plus middleware-gated routes for the landing UI)

## Public Paths in Middleware

```typescript
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/privacy", "/cookies", "/terms",
  "/blog", "/book", "/event", "/gallery",
  "/api/auth/login", "/api/auth/logout",
  "/api/contacts",
  "/api/gallery",
  "/api/analytics/track",
  "/api/uploads/",
  "/api/newsletter/subscribe",
  "/api/newsletter/unsubscribe",
  "/api/bookings/public",
  "/api/availability",
  "/api/event-leads"
];
```
