import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { getClientAccess } from "@/lib/auth/client-access";

// GET /api/panel/documents/:id/download — stream the private file if caller owns it
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  const doc = await prisma.clientDocument.findUnique({ where: { id } });
  if (!doc) return new NextResponse("Not found", { status: 404 });

  // Isolation: client can only read own docs; admin can read any
  if (session.role !== "ADMIN" && doc.clientId !== session.sub) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Inactive clients: respect the configured access flag for documents
  if (session.role !== "ADMIN") {
    const access = await getClientAccess(session);
    if (!access.allowedAreas.documents) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // Use fileKey (the actual filename in public/uploads/) — not fileUrl which
  // may point to `/api/uploads/<name>` (the caché-bypass endpoint) and would
  // break path resolution.
  const filename = doc.fileKey;

  // Sanitize — only allow safe chars (timestamp-hex.ext)
  if (!/^[\w.-]+$/.test(filename)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const uploadsBase = path.join(process.cwd(), "public", "uploads");
  const filepath = path.join(uploadsBase, filename);

  // Final path-traversal guard
  if (!filepath.startsWith(uploadsBase)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await readFile(filepath);
    const body = new Uint8Array(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    );

    // For PDFs and images, inline (browser displays). For others, attachment (browser downloads).
    const inlineMimes = /^(image\/|application\/pdf|text\/)/;
    const disposition = inlineMimes.test(doc.fileMime) ? "inline" : "attachment";

    // Build a friendly filename (title + original extension)
    const ext = path.extname(filename);
    const friendly = `${doc.title.replace(/[^\w\s.-]/g, "_")}${ext}`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": doc.fileMime || "application/octet-stream",
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(friendly)}"`,
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
