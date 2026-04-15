import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const updateImageSchema = z.object({
  alt: z.string().max(300).optional(),
  order: z.number().int().min(0).optional(),
  gallery: z.boolean().optional(),
});

// PATCH /api/images/:id — update alt text, order, gallery flag
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateImageSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const existing = await prisma.image.findUnique({ where: { id } });
    if (!existing) return error("Imagen no encontrada", 404);

    const image = await prisma.image.update({
      where: { id },
      data: parsed.data,
    });

    return success(image);
  } catch {
    return error("No autorizado", 403);
  }
}

// DELETE /api/images/:id — delete from DB and remove file from disk
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.image.findUnique({ where: { id } });
    if (!existing) return error("Imagen no encontrada", 404);

    // Delete from database
    await prisma.image.delete({ where: { id } });

    // Try to delete file from disk (local uploads start with /uploads/)
    if (existing.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", existing.url);
      try {
        await unlink(filePath);
      } catch {
        // File may already be deleted or not local — ignore
        console.warn(`[images] Could not delete file: ${filePath}`);
      }
    }

    return success({ deleted: true });
  } catch {
    return error("No autorizado", 403);
  }
}
