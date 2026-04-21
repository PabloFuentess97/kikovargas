import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// Admin-only: delete a client's check-in
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; checkinId: string }> }) {
  await requireAdmin();
  const { id: clientId, checkinId } = await params;

  const checkIn = await prisma.clientCheckIn.findFirst({ where: { id: checkinId, clientId } });
  if (!checkIn) return error("No encontrado", 404);

  await prisma.clientCheckIn.delete({ where: { id: checkinId } });

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
