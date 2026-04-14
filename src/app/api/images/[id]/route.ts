import { NextRequest } from "next/server";
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

// DELETE /api/images/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.image.findUnique({ where: { id } });
    if (!existing) return error("Imagen no encontrada", 404);

    await prisma.image.delete({ where: { id } });

    return success({ deleted: true });
  } catch {
    return error("No autorizado", 403);
  }
}
