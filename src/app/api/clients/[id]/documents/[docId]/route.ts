import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  await requireAdmin();
  const { id: clientId, docId } = await params;

  const doc = await prisma.clientDocument.findFirst({ where: { id: docId, clientId } });
  if (!doc) return error("Documento no encontrado", 404);

  await prisma.clientDocument.delete({ where: { id: docId } });

  // Best-effort: delete physical file
  if (doc.fileUrl.startsWith("/uploads/")) {
    try {
      const filepath = path.join(process.cwd(), "public", doc.fileUrl);
      await fs.unlink(filepath);
    } catch {
      // already gone
    }
  }

  return success({ deleted: true });
}
