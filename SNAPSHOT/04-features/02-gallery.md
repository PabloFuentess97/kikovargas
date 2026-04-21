# Feature — Gallery System

## Overview

Image management system for:
- Uploading images via drag-and-drop
- Tagging images as "featured" for landing gallery
- Storing metadata (alt text, dimensions, size)
- Reusing images as post covers, event page media, etc.

## Data Model

```typescript
Image {
  id: string (cuid)
  url: string               // Public URL
  key: string (unique)      // Storage key / filename
  alt: string               // Alt text (default "")
  width: number | null
  height: number | null
  size: number | null       // Bytes
  mime: string              // Default "image/jpeg"
  gallery: boolean          // If true, shown in landing gallery
  order: number             // Sort order within gallery
  postId: string | null     // FK to Post if linked
  createdAt: Date
}
```

## Upload Flow

### 1. User drops/selects files
```
/dashboard/gallery
→ Drop zone accepts: JPG, PNG, WebP
→ Max 5 MB per file, up to 10 files per batch
```

### 2. Client uploads via `/api/upload`
```http
POST /api/upload
Content-Type: multipart/form-data
Authorization: Admin session

Response:
{
  success: true,
  data: {
    uploaded: [
      { url: "/uploads/1734567890-abc123.jpg", key: "1734567890-abc123.jpg",
        width: 1920, height: 1080, size: 245678, mime: "image/jpeg" }
    ],
    errors: []
  }
}
```

### 3. Client creates DB record via `/api/images`
For each uploaded file:
```http
POST /api/images
Body: {
  url: "/uploads/1734567890-abc123.jpg",
  key: "1734567890-abc123.jpg",
  alt: "1734567890-abc123",          // Auto from filename
  width: 1920, height: 1080, size: 245678,
  mime: "image/jpeg",
  gallery: false,                     // Default to hidden
  order: 0
}
```

### 4. User toggles `gallery` flag
```
Click star icon → PATCH /api/images/{id} with { gallery: true }
```

## File Storage

**Location:** `public/uploads/` in the Next.js app.
**Mount:** Docker volume `./uploads:/app/public/uploads` (persists across containers).
**Filename:** Timestamp + random hash (e.g., `1734567890-a4f3b.jpg`).
**Served via:** `/api/uploads/{filepath}` route (bypasses Next.js cache for dynamic files).

## Gallery Management UI

**File:** `src/app/(admin)/dashboard/gallery/gallery-manager.tsx`

### Filters (tabs at top)
- `Todas` — All images
- `En landing` — Only `gallery: true`
- `Ocultas` — Only `gallery: false`

### Image Card Actions
1. **Star toggle** — Toggle `gallery` flag
2. **Edit alt** — Modal to update alt text
3. **Delete** — Confirmation → `DELETE /api/images/{id}` (also deletes file from disk)

### Drag reorder
- Applies to featured/gallery images only
- Updates `order` field for each via batch `PATCH /api/images/{id}`

## Public Gallery

### `/` (Landing page gallery section)
```typescript
// GallerySection
const images = await prisma.image.findMany({
  where: { gallery: true },
  orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  take: 6
});

return <GalleryGrid images={images} />;
```

### Masonry Layout
`GalleryGrid` component:
- Index 0: 2-column × 2-row span (hero image)
- Index 3: 1-column × 2-row span
- Others: 1×1
- Responsive CSS grid

### Lightbox
- Click image → full-screen modal
- Keyboard navigation: `←` `→` arrows
- `Esc` to close
- Swipe gestures on mobile

### `/gallery` — Full gallery page
Shows all `gallery: true` images in a larger grid with pagination.

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/images` | Admin | List all images |
| POST | `/api/images` | Admin | Create image record |
| PATCH | `/api/images/:id` | Admin | Update alt, order, gallery flag |
| DELETE | `/api/images/:id` | Admin | Delete image + file |
| GET | `/api/gallery` | Public | List gallery=true images |
| POST | `/api/upload` | Admin | Upload files, return URLs |
| GET | `/api/uploads/:filepath` | Public | Serve uploaded file |

## Upload Validation

```typescript
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_FILES = 10;

for (const file of files) {
  if (!ALLOWED_MIMES.includes(file.type))
    throw new Error(`Formato no soportado: ${file.type}`);
  if (file.size > MAX_SIZE)
    throw new Error(`Archivo demasiado grande: ${file.name}`);
}

if (files.length > MAX_FILES)
  throw new Error(`Máximo ${MAX_FILES} archivos a la vez`);
```

## Naming Convention

```typescript
const ext = path.extname(file.name).toLowerCase();
const hash = crypto.randomBytes(4).toString("hex");
const filename = `${Date.now()}-${hash}${ext}`;
// Example: 1734567890-a4f3b8.jpg
```

## Alt Text Best Practices (documented in KB)

- Auto-generated from filename (as fallback)
- User should edit each image's alt for:
  - SEO (Google uses it to understand images)
  - Accessibility (screen readers)
- Edit via star → pencil modal
