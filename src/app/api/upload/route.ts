import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth/session";

// Force Node.js runtime (needed for fs/path/crypto)
export const runtime = "nodejs";

/** Allowed MIME types */
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

/** Maximum file size: 5 MB */
const MAX_SIZE = 5 * 1024 * 1024;

/** Maximum files per request */
const MAX_FILES = 10;

/** Upload directory (inside /public so Next.js serves them statically) */
function getUploadDir() {
  return path.join(process.cwd(), "public", "uploads");
}

/** Generate a unique filename preserving the original extension */
function uniqueName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const hash = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
}

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// POST /api/upload — Upload one or more image files
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonResponse({ success: false, error: "No autorizado" }, 403);
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return jsonResponse(
        { success: false, error: "Content-Type debe ser multipart/form-data" },
        400,
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return jsonResponse({ success: false, error: "No se enviaron archivos" }, 400);
    }

    if (files.length > MAX_FILES) {
      return jsonResponse(
        { success: false, error: `Maximo ${MAX_FILES} archivos por solicitud` },
        400,
      );
    }

    // Ensure upload directory exists
    const uploadDir = getUploadDir();
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Test write permissions
    try {
      const testFile = path.join(uploadDir, ".write-test");
      await writeFile(testFile, "");
      const { unlink } = await import("fs/promises");
      await unlink(testFile).catch(() => {});
    } catch {
      console.error("[upload] No write permission to:", uploadDir);
      return jsonResponse(
        { success: false, error: "El servidor no tiene permisos de escritura en el directorio de uploads" },
        500,
      );
    }

    const results: { url: string; key: string; name: string; size: number; mime: string }[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Validate type
      if (!ALLOWED_TYPES.has(file.type)) {
        errors.push(`${file.name}: tipo no permitido (${file.type}). Solo JPG, PNG, WebP.`);
        continue;
      }

      // Validate size
      if (file.size > MAX_SIZE) {
        errors.push(
          `${file.name}: excede el limite de 5MB (${(file.size / 1024 / 1024).toFixed(1)}MB).`,
        );
        continue;
      }

      // Read file bytes
      const bytes = new Uint8Array(await file.arrayBuffer());

      // Generate unique filename and write to disk
      const filename = uniqueName(file.name);
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, bytes);

      // URL is relative to public/
      const url = `/uploads/${filename}`;

      results.push({
        url,
        key: filename,
        name: file.name,
        size: file.size,
        mime: file.type,
      });
    }

    if (results.length === 0 && errors.length > 0) {
      return jsonResponse({ success: false, error: errors.join(" ") }, 400);
    }

    return jsonResponse({ success: true, data: { uploaded: results, errors } }, 201);
  } catch (err) {
    console.error("[upload] Error:", err);
    const message = err instanceof Error ? err.message : "Error interno al procesar la subida";
    return jsonResponse({ success: false, error: message }, 500);
  }
}
