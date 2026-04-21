import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

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

  // fileUrl is like "/uploads/xxxxx.pdf" — resolve to the on-disk path
  const safeRel = doc.fileUrl.replace(/^\//, "");
  const filepath = path.join(process.cwd(), "public", safeRel);

  // Prevent path traversal
  const uploadsBase = path.join(process.cwd(), "public", "uploads");
  if (!filepath.startsWith(uploadsBase)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await readFile(filepath);
    // Copy into a fresh Uint8Array so it matches BodyInit without legacy Buffer typing
    const body = new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": doc.fileMime || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.title)}"`,
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
