# Database — Relations & Field Explanations

## Relation Map

```
User ──< Post (1:N, via authorId)
Post ──── Image (1:1, via coverId for cover)
Post ──< Image (1:N, via postId for gallery)

BookingLink ──< Booking (1:N)

EventPage ──< EventBlock (1:N)
EventPage ──< EventLead (1:N)

KbCategory ←← KbArticle (logical, via categoryId — no FK)
```

## Tables Explained

### `users`
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `email` | String unique | Login identifier |
| `password` | String | **bcrypt hashed** |
| `name` | String | Display name |
| `role` | Role (ADMIN/USER) | Only ADMIN can access panel |
| `active` | Boolean | Soft disable |
| `createdAt` / `updatedAt` | DateTime | Auto timestamps |

**Relations:** `posts[]` as author

### `posts`
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `title` | String | Post title |
| `slug` | String unique | URL-friendly identifier |
| `excerpt` | String? | Max 500 chars, shown in listing |
| `content` | String | Full HTML from TipTap editor |
| `status` | PostStatus | DRAFT / PUBLISHED / ARCHIVED |
| `publishedAt` | DateTime? | Set when first published |
| `authorId` | FK → users.id | Restrict on delete |
| `coverId` | FK → images.id (unique) | SetNull on delete |

**Indexes:** `(status, publishedAt)`, `(authorId)`

**Relations:**
- `author` → User (required, Restrict)
- `cover` → Image (optional, unique 1:1)
- `images[]` → Image (gallery, Cascade on post delete)

### `images`
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `url` | String | Public URL |
| `key` | String unique | Storage key (filename) |
| `alt` | String | Accessibility + SEO |
| `width` / `height` | Int? | Pixel dimensions |
| `size` | Int? | Bytes |
| `mime` | String | MIME type (default `image/jpeg`) |
| `gallery` | Boolean | If true, appears in landing gallery |
| `order` | Int | Sort order in gallery |
| `postId` | FK? → posts.id | Cascade (belongs to post gallery) |

**Indexes:** `(postId)`, `(gallery, order)`

### `page_views`
Analytics tracking. One row per page view.
| Field | Type | Notes |
|-------|------|-------|
| `path` | String | URL path viewed |
| `referrer` | String | HTTP Referer header |
| `userAgent` | String | Parsed for device/browser/OS |
| `ip` | String | Client IP |
| `country` / `city` | String | From CloudFlare/Vercel headers |
| `device` | String | desktop / mobile / tablet |
| `browser` | String | Parsed browser name |
| `os` | String | Parsed OS |

**Indexes:** `(createdAt)`, `(path)`

### `site_config`
Flexible key-value store for landing configuration.
| Field | Type | Notes |
|-------|------|-------|
| `key` | String PK | Section identifier (theme/hero/about/etc.) |
| `value` | Json | Section-specific payload (structured) |

**Used keys:**
- `theme` → ThemeConfig
- `sections` → SectionsConfig (visibility toggles)
- `hero` → HeroContent
- `about` → AboutContent
- `stats` → StatsContent
- `contact` → ContactContent
- `social` → SocialLinks
- `navbar` → NavbarContent
- `ai` → AIConfig (**encrypted API keys**)
- `email` → EmailConfig (**encrypted API keys**)

### `subscribers`
Newsletter email list.
| Field | Type | Notes |
|-------|------|-------|
| `email` | String unique | Subscriber email |
| `name` | String | Optional name |
| `active` | Boolean | False if unsubscribed |
| `confirmedAt` | DateTime? | Future: double opt-in |
| `unsubscribedAt` | DateTime? | When user unsubscribed |

### `campaigns`
Newsletter campaigns.
| Field | Type | Notes |
|-------|------|-------|
| `subject` | String | Email subject line |
| `content` | String | HTML body |
| `template` | String | `custom` or `new_post` |
| `postId` | String? | If template=new_post |
| `status` | DRAFT / SENT | |
| `sentAt` | DateTime? | When sent |
| `sentCount` | Int | Number of successful deliveries |

### `booking_links`
Bookable services.
| Field | Type | Notes |
|-------|------|-------|
| `slug` | String unique | URL: `/book/{slug}` |
| `title` | String | Display name |
| `description` | String | Shown on booking page |
| `duration` | Int | Minutes per session (15-480) |
| `active` | Boolean | If false, slug returns 404 |
| `expiresAt` | DateTime? | If set, link auto-disables |

### `bookings`
Actual booked sessions.
| Field | Type | Notes |
|-------|------|-------|
| `date` | DateTime | Start date/time (UTC) |
| `duration` | Int | Minutes (snapshot from link) |
| `name` / `email` / `phone` / `notes` | String | Client data |
| `status` | PENDING / CONFIRMED / CANCELLED | Workflow |
| `linkId` | FK → booking_links.id | Cascade |

### `availability`
Weekly recurring availability.
| Field | Type | Notes |
|-------|------|-------|
| `dayOfWeek` | Int unique | 0=Sunday, 1=Monday, …, 6=Saturday |
| `startTime` | String | "HH:mm" in server local time |
| `endTime` | String | "HH:mm" |
| `active` | Boolean | Enable/disable day |

**Unique constraint:** `dayOfWeek` — only one row per day.

### `event_pages`
Landing pages built with the block builder.
| Field | Type | Notes |
|-------|------|-------|
| `slug` | String unique | URL: `/event/{slug}` |
| `title` | String | Page title |
| `description` | String | SEO meta description |
| `status` | DRAFT / PUBLISHED / ARCHIVED | |
| `template` | String | `custom` / `webinar` / `fitness` / `coaching` |

### `event_blocks`
Ordered blocks per event page.
| Field | Type | Notes |
|-------|------|-------|
| `type` | String | One of 14 block types |
| `data` | Json | Block-specific payload |
| `order` | Int | Sort order within page |
| `pageId` | FK → event_pages.id | Cascade |

**14 block types:**
`hero`, `text`, `image`, `cta`, `gallery`, `form`, `countdown`, `faq`, `testimonials`, `video`, `pricing`, `stats`, `divider`, `features`

### `event_leads`
Submissions from event page forms.
| Field | Type | Notes |
|-------|------|-------|
| `name` / `email` / `phone` / `message` | String | Form data |
| `pageId` | FK → event_pages.id | Cascade |

### `contacts`
Submissions from main contact form (and other sources).
| Field | Type | Notes |
|-------|------|-------|
| `name` / `email` / `phone` / `subject` / `message` | String | Form data |
| `status` | PENDING / READ / REPLIED / ARCHIVED | Workflow |
| `readAt` | DateTime? | Auto-set on first admin view |
| `repliedAt` | DateTime? | Set when status becomes REPLIED |

### `kb_categories`
Knowledge base categories.
| Field | Type | Notes |
|-------|------|-------|
| `id` | String PK | e.g., `getting-started` |
| `label` | String | Display name |
| `icon` | String | Emoji (e.g., "🚀") |
| `description` | String | Short tagline |
| `sortOrder` | Int | Sort order |

### `kb_articles`
Knowledge base articles.
| Field | Type | Notes |
|-------|------|-------|
| `id` | String PK | e.g., `getting-started/welcome` |
| `categoryId` | String | Logical FK to kb_categories.id |
| `title` | String | Article title |
| `content` | String | HTML content |
| `sortOrder` | Int | Sort within category |

## Cascade Behavior Summary

| Deleting... | Cascades to... |
|-------------|----------------|
| User | **Restrict** — can't delete if they have posts |
| Post | Images (gallery) — Cascade |
| Post | Image (cover) — SetNull (image keeps, post loses cover) |
| Image (cover) | Post.coverId — SetNull |
| BookingLink | All its Bookings — Cascade |
| EventPage | All its EventBlocks + EventLeads — Cascade |

## Data Integrity Notes

- **Slug uniqueness** enforced at DB level for: `posts`, `booking_links`, `event_pages`
- **Email uniqueness** enforced for: `users`, `subscribers`
- **Day uniqueness** for availability (one row per day of week)
- **Cover uniqueness**: a post can only be a cover for one image (`coverId` is @unique)
- **JSONB** used for `site_config.value`, `event_blocks.data` (flexible structure)
