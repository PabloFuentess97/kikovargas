# Security — File Upload Protection

## Threat Model

Uncontrolled file upload is a major attack vector:
- Executable files uploaded and served back (RCE)
- Huge files exhausting disk/RAM (DoS)
- Path traversal attempts (reading sensitive files)
- Malicious SVGs (XSS)
- Mislabeled files (polyglots)

## Mitigations Implemented

### 1. Admin-only endpoint

`POST /api/upload` is guarded by `requireAdmin()`. Public users cannot upload.

### 2. MIME type allowlist

```typescript
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

for (const file of files) {
  if (!ALLOWED_MIMES.includes(file.type)) {
    errors.push({ filename: file.name, message: "Formato no soportado" });
    continue;
  }
}
```

**Note:** SVG is NOT allowed (would enable XSS via embedded scripts).

### 3. Size limits

```typescript
const MAX_SIZE = 5 * 1024 * 1024;  // 5 MB

if (file.size > MAX_SIZE) {
  errors.push({ filename: file.name, message: "Archivo demasiado grande" });
  continue;
}
```

### 4. Batch limit

```typescript
const MAX_FILES = 10;

if (files.length > MAX_FILES) {
  return error(`Máximo ${MAX_FILES} archivos a la vez`, 413);
}
```

### 5. Filename sanitization

User-provided filenames are never used. Instead:
```typescript
import crypto from "crypto";
import path from "path";

const ext = path.extname(file.name).toLowerCase();
const hash = crypto.randomBytes(4).toString("hex");
const sanitizedFilename = `${Date.now()}-${hash}${ext}`;
// Example: 1734567890-a4f3b8.jpg
```

This prevents:
- Path traversal (`../../etc/passwd`)
- Collisions (duplicate names)
- Reserved names (`CON`, `PRN` on Windows)
- Special chars in names

### 6. Storage isolation

Files are saved to `public/uploads/` only:
```typescript
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure absolute path stays inside UPLOAD_DIR
const safePath = path.join(UPLOAD_DIR, sanitizedFilename);
if (!safePath.startsWith(UPLOAD_DIR)) {
  throw new Error("Path traversal attempt");
}
```

### 7. Content-Type override on serving

The `/api/uploads/:filepath` route explicitly sets the `Content-Type` header based on file extension (not trusting original MIME):

```typescript
const ext = path.extname(filepath).toLowerCase();
const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

headers.set("Content-Type", CONTENT_TYPES[ext] || "application/octet-stream");
headers.set("X-Content-Type-Options", "nosniff");
```

### 8. Filename validation on serving

```typescript
// Must match the sanitized pattern only
if (!/^[\w-]+\.(jpg|jpeg|png|webp)$/i.test(filepath)) {
  return new NextResponse("Not Found", { status: 404 });
}
```

### 9. Image extraction

We do NOT:
- Process images server-side with ImageMagick/Sharp in a pipeline
- Store EXIF metadata
- Execute any transformation code

Files are stored as-is (byte-identical to upload).

### 10. Magic byte validation (optional)

Currently relies on MIME type from the browser. A stronger implementation would check the first bytes:
```typescript
// JPEG: FF D8 FF
// PNG: 89 50 4E 47
// WebP: 52 49 46 46 ... 57 45 42 50
```

## Docker Volume

Uploads are stored in a bind mount:
```yaml
volumes:
  - ./uploads:/app/public/uploads
```

This means:
- Files survive container restarts
- Can be backed up independently
- Can be served via a CDN or reverse proxy if needed
- **Host path** `./uploads/` must be writable by UID 1001 (container user)

Ensure permissions at setup:
```bash
mkdir -p ./uploads
chown -R 1001:1001 ./uploads
chmod -R 755 ./uploads
```

## Delete Flow

```typescript
// DELETE /api/images/:id
const image = await prisma.image.findUnique({ where: { id } });
if (!image) return error("Not found", 404);

// Delete DB record first
await prisma.image.delete({ where: { id } });

// Then attempt to delete the file
if (image.url.startsWith("/uploads/")) {
  try {
    const filepath = path.join(process.cwd(), "public", image.url);
    await fs.unlink(filepath);
  } catch {
    // File may already be gone; don't fail the request
  }
}
```

## Rate Limiting

Not implemented, but recommended:
- Limit uploads per IP/user (e.g., 50/hour)
- Use middleware or a service like Upstash Rate Limiter

## Content Security Policy

Landing page should set CSP headers:
```
Content-Security-Policy:
  default-src 'self';
  img-src 'self' data: https:;
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
```

Not currently in `next.config.ts` — can be added for additional hardening.

## Summary

| Protection | Status |
|------------|--------|
| Admin-only endpoint | ✓ |
| MIME allowlist | ✓ |
| Size limit (5 MB) | ✓ |
| Count limit (10 files) | ✓ |
| Filename sanitization | ✓ |
| Path traversal prevention | ✓ |
| Content-Type override | ✓ |
| `X-Content-Type-Options: nosniff` | ✓ |
| Docker volume isolation | ✓ |
| Magic byte validation | ✗ (future) |
| Rate limiting | ✗ (future) |
| CSP headers | ✗ (future) |
