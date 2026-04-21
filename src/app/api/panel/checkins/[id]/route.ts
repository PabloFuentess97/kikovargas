import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db/prisma";
import { requireClientAreaApi } from "@/lib/auth/api-client-access";
import { success, error } from "@/lib/api-response";

// DELETE /api/panel/checkins/:id — client deletes own check-in
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireClientAreaApi("progress");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const { id } = await params;

  const checkIn = await prisma.clientCheckIn.findUnique({ where: { id } });
  if (!checkIn) return error("No encontrado", 404);

  // Ownership: admin any; client only own
  if (session!.role !== "ADMIN" && checkIn.clientId !== session!.sub) {
    return error("No encontrado", 404);
  }

  await prisma.clientCheckIn.delete({ where: { id } });

  // Best-effort photo cleanup
  const keys = [checkIn.photoFrontKey, checkIn.photoSideKey, checkIn.photoBackKey].filter(Boolean) as string[];
  for (const key of keys) {
    try {
      await fs.unlink(path.join(process.cwd(), "public", "uploads", key));
    } catch {
      // ignore
    }
  }

  return success({ deleted: true });
}
