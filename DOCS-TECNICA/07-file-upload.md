# 07 · Sistema de carga de archivos

## Almacenamiento

**Ubicación en contenedor:** `/app/public/uploads/`
**Ubicación en host:** `./uploads/` (bind mount via docker-compose)
**URL pública:** `/uploads/{filename}`
**Servido por:** Next.js (archivos estáticos en `public/`) o por el endpoint `/api/uploads/:filepath` (caché bypass).

## Volumen Docker

```yaml
# docker-compose.yml
app:
  volumes:
    - ./uploads:/app/public/uploads
```

**Implicaciones:**
- Los archivos sobreviven a recreación del contenedor.
- Son accesibles directamente desde el host (útil para backups).
- Propiedad del directorio host: debe ser `1001:1001` (el usuario `nextjs` del contenedor) o `777`.

En `docker-entrypoint.sh` hay un test de escritura:
```sh
UPLOADS_DIR="/app/public/uploads"
mkdir -p "$UPLOADS_DIR" 2>/dev/null
if touch "$UPLOADS_DIR/.write-test" 2>/dev/null; then
  rm -f "$UPLOADS_DIR/.write-test"
  log "Uploads directory OK (writable)"
else
  log "WARNING: Uploads directory NOT writable. Fix: chown -R 1001:1001 ./uploads"
fi
```

## Flujo de carga

### Endpoint `POST /api/upload`

**Archivo:** `src/app/api/upload/route.ts`
**Auth:** Admin
**Content-Type:** `multipart/form-data`
**Field:** `files` (puede repetirse para multi-upload)

**Flow del handler:**

```typescript
export async function POST(req: NextRequest) {
  await requireAdmin();

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length > MAX_FILES) {
    return error(`Máximo ${MAX_FILES} archivos`, 413);
  }

  const uploaded = [];
  const errors = [];

  for (const file of files) {
    // Validación MIME
    if (!ALLOWED_MIMES.includes(file.type)) {
      errors.push({ filename: file.name, message: "Formato no soportado" });
      continue;
    }
    // Validación tamaño
    if (file.size > MAX_SIZE) {
      errors.push({ filename: file.name, message: "Archivo > 5 MB" });
      continue;
    }

    // Nombre sanitizado
    const ext = path.extname(file.name).toLowerCase();
    const hash = crypto.randomBytes(4).toString("hex");
    const filename = `${Date.now()}-${hash}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Escribe al disco
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    uploaded.push({
      url: `/uploads/${filename}`,
      key: filename,
      size: file.size,
      mime: file.type,
      // width/height no se extraen por simplicidad
    });
  }

  return success({ uploaded, errors });
}
```

### Constantes

```typescript
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_FILES = 10;
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];
```

**SVG está prohibido deliberadamente** — puede contener `<script>` (XSS).

### Flujo completo client-side (gallery-manager.tsx)

```typescript
async function handleUpload(files: File[]) {
  // 1. Upload físico
  const formData = new FormData();
  files.forEach(f => formData.append("files", f));

  const uploadRes = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });
  const { data: { uploaded, errors } } = await uploadRes.json();

  // 2. Crear registros DB para cada archivo exitoso
  for (const file of uploaded) {
    await fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: file.url,
        key: file.key,
        alt: file.key.split(".")[0],
        size: file.size,
        mime: file.mime,
        gallery: false,  // por defecto oculto
        order: 0
      })
    });
  }

  // 3. Refresh UI
  router.refresh();
}
```

## Estrategia de nombrado

Formato: `{timestamp}-{hash8}.{ext}`

Ejemplos:
```
1734567890-a4f3b8.jpg
1734567891-9e2c71.webp
```

**Propiedades:**
- Único (timestamp ms + hash evita colisiones).
- No revela el nombre original (privacidad).
- Ordenable cronológicamente.
- Solo caracteres seguros para URL.

**Imagen generada por IA:** prefijo `ai-`:
```
ai-1734567890-a4f3b8.png
```

## Servicio de archivos

### Opción 1 — Next.js static
Los archivos en `public/` se sirven automáticamente como estáticos.
URL: `/uploads/1734567890-a4f3b8.jpg`.
Caché: según configuración de Next.js (por defecto, max-age=60).

### Opción 2 — Endpoint `/api/uploads/:filepath`
**Archivo:** `src/app/api/uploads/[...path]/route.ts`
Bypass del caché de Next.js. Útil para archivos recién subidos que podrían estar cacheados como 404.

```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filepath = pathSegments.join("/");

  // Validación estricta de nombre
  if (!/^[\w-]+\.(jpg|jpeg|png|webp)$/i.test(filepath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const fullPath = path.join(UPLOAD_DIR, filepath);
  // Prevención de path traversal
  if (!fullPath.startsWith(UPLOAD_DIR)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const file = await fs.readFile(fullPath);
    const ext = path.extname(filepath).toLowerCase();
    const mime = CONTENT_TYPES[ext] || "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": mime,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
```

## Eliminación

**Endpoint:** `DELETE /api/images/:id`

```typescript
const image = await prisma.image.findUnique({ where: { id } });
if (!image) return error("Not found", 404);

// 1. Borra DB
await prisma.image.delete({ where: { id } });

// 2. Intenta borrar del disco
if (image.url.startsWith("/uploads/")) {
  try {
    const filepath = path.join(process.cwd(), "public", image.url);
    await fs.unlink(filepath);
  } catch {
    // File may already be gone; don't fail
  }
}
```

## Validaciones de seguridad

- **MIME allowlist** (no denylist).
- **Magic bytes check**: NO implementado (se confía en el header). Mejora pendiente — ver `14-known-issues.md`.
- **Size limit**: 5 MB (hardcoded).
- **Count limit**: 10 archivos por request (413 si se excede).
- **Path traversal**: nombre de archivo sanitizado (timestamp+hash, sin path components del usuario).
- **No ejecutables**: solo MIMEs de imagen.

## Backup

```bash
# Backup del directorio
tar czf uploads-$(date +%Y%m%d).tar.gz uploads/

# Restore
tar xzf uploads-YYYYMMDD.tar.gz
chown -R 1001:1001 uploads/
```

En el futuro (ver `15-future-improvements.md`), se podría migrar a S3 / R2 / cloud storage.

## Límites y consideraciones

- **Disco:** en VPS pequeño con miles de imágenes, el directorio `uploads/` puede crecer. Monitorear.
- **Migración a CDN:** preparada (el campo `Image.url` es arbitrario — podría cambiarse a URL absoluta de S3 sin romper nada más que el delete handler).
- **Imagenes huérfanas:** si un usuario sube a `/api/upload` pero no completa `/api/images`, el archivo queda en disco sin registro DB. No hay cleanup automático.
