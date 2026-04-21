# Database — Full Prisma Schema

## Configuration

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

- **Database:** PostgreSQL 16
- **ORM:** Prisma 7.7.0
- **Generated client path:** `src/generated/prisma` (gitignored, regenerated on build)
- **Schema file:** `prisma/schema.prisma`

## Full Schema

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ─── Enums ──────────────────────────────────────────

enum Role {
  ADMIN
  USER
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum ContactStatus {
  PENDING
  READ
  REPLIED
  ARCHIVED
}

enum CampaignStatus {
  DRAFT
  SENT
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

enum EventPageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ─── User ───────────────────────────────────────────

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  posts Post[] @relation("PostAuthor")

  @@map("users")
}

// ─── Post ───────────────────────────────────────────

model Post {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  excerpt     String?
  content     String
  status      PostStatus @default(DRAFT)
  publishedAt DateTime?  @map("published_at")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  authorId String @map("author_id")
  author   User   @relation("PostAuthor", fields: [authorId], references: [id], onDelete: Restrict)

  coverId String? @unique @map("cover_id")
  cover   Image?  @relation("PostCover", fields: [coverId], references: [id], onDelete: SetNull)

  images Image[] @relation("PostGallery")

  @@index([status, publishedAt])
  @@index([authorId])
  @@map("posts")
}

// ─── Image ──────────────────────────────────────────

model Image {
  id        String   @id @default(cuid())
  url       String
  key       String   @unique // storage key
  alt       String   @default("")
  width     Int?
  height    Int?
  size      Int?
  mime      String   @default("image/jpeg")
  gallery   Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")

  coverOf Post? @relation("PostCover")

  postId String? @map("post_id")
  post   Post?   @relation("PostGallery", fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([gallery, order])
  @@map("images")
}

// ─── PageView ──────────────────────────────────────

model PageView {
  id        String   @id @default(cuid())
  path      String
  referrer  String   @default("")
  userAgent String   @default("") @map("user_agent")
  ip        String   @default("")
  country   String   @default("")
  city      String   @default("")
  device    String   @default("")
  browser   String   @default("")
  os        String   @default("")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([createdAt])
  @@index([path])
  @@map("page_views")
}

// ─── SiteConfig (key-value JSON store) ─────────────

model SiteConfig {
  key       String   @id
  value     Json
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("site_config")
}

// ─── Subscriber ─────────────────────────────────────

model Subscriber {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String    @default("")
  active         Boolean   @default(true)
  confirmedAt    DateTime? @map("confirmed_at")
  unsubscribedAt DateTime? @map("unsubscribed_at")
  createdAt      DateTime  @default(now()) @map("created_at")

  @@index([active])
  @@index([createdAt])
  @@map("subscribers")
}

// ─── Campaign ───────────────────────────────────────

model Campaign {
  id        String         @id @default(cuid())
  subject   String
  content   String
  template  String         @default("custom")  // "new_post" | "custom"
  postId    String?        @map("post_id")
  status    CampaignStatus @default(DRAFT)
  sentAt    DateTime?      @map("sent_at")
  sentCount Int            @default(0) @map("sent_count")
  createdAt DateTime       @default(now()) @map("created_at")
  updatedAt DateTime       @updatedAt @map("updated_at")

  @@index([status])
  @@index([createdAt])
  @@map("campaigns")
}

// ─── BookingLink ────────────────────────────────────

model BookingLink {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String    @default("Reserva tu cita")
  description String    @default("")
  duration    Int       @default(60)
  active      Boolean   @default(true)
  expiresAt   DateTime? @map("expires_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  bookings Booking[]

  @@index([active])
  @@index([expiresAt])
  @@map("booking_links")
}

// ─── Booking ────────────────────────────────────────

model Booking {
  id        String        @id @default(cuid())
  date      DateTime
  duration  Int           @default(60)
  name      String
  email     String
  phone     String        @default("")
  notes     String        @default("")
  status    BookingStatus @default(CONFIRMED)
  createdAt DateTime      @default(now()) @map("created_at")
  updatedAt DateTime      @updatedAt @map("updated_at")

  linkId String      @map("link_id")
  link   BookingLink @relation(fields: [linkId], references: [id], onDelete: Cascade)

  @@index([linkId])
  @@index([date])
  @@index([status])
  @@index([email])
  @@map("bookings")
}

// ─── Availability ───────────────────────────────────

model Availability {
  id        String   @id @default(cuid())
  dayOfWeek Int      // 0=Sunday, 1=Monday ... 6=Saturday
  startTime String   // "HH:mm"
  endTime   String   // "HH:mm"
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([dayOfWeek])
  @@index([active])
  @@map("availability")
}

// ─── EventPage (Landing Builder) ────────────────────

model EventPage {
  id          String          @id @default(cuid())
  slug        String          @unique
  title       String
  description String          @default("")
  status      EventPageStatus @default(DRAFT)
  template    String          @default("custom")
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  blocks EventBlock[]
  leads  EventLead[]

  @@index([status])
  @@index([slug])
  @@map("event_pages")
}

model EventBlock {
  id      String @id @default(cuid())
  type    String // 14 block types
  data    Json   // block-specific content
  order   Int    @default(0)

  pageId String    @map("page_id")
  page   EventPage @relation(fields: [pageId], references: [id], onDelete: Cascade)

  @@index([pageId, order])
  @@map("event_blocks")
}

model EventLead {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String   @default("")
  message   String   @default("")
  createdAt DateTime @default(now()) @map("created_at")

  pageId String    @map("page_id")
  page   EventPage @relation(fields: [pageId], references: [id], onDelete: Cascade)

  @@index([pageId])
  @@index([email])
  @@index([createdAt])
  @@map("event_leads")
}

// ─── KnowledgeBase ──────────────────────────────────

model KbArticle {
  id         String   @id   // "category-id/article-id"
  categoryId String   @map("category_id")
  title      String
  content    String   // HTML
  sortOrder  Int      @default(0) @map("sort_order")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@index([categoryId, sortOrder])
  @@map("kb_articles")
}

model KbCategory {
  id          String   @id
  label       String
  icon        String   @default("📄")
  description String   @default("")
  sortOrder   Int      @default(0) @map("sort_order")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([sortOrder])
  @@map("kb_categories")
}

// ─── Contact ────────────────────────────────────────

model Contact {
  id        String        @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String
  message   String
  status    ContactStatus @default(PENDING)
  readAt    DateTime?     @map("read_at")
  repliedAt DateTime?     @map("replied_at")
  createdAt DateTime      @default(now()) @map("created_at")

  @@index([status])
  @@index([createdAt])
  @@map("contacts")
}
```
