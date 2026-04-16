import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

// GET /api/event-pages/[id] — get with blocks (admin)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const page = await prisma.eventPage.findUnique({
      where: { id },
      include: {
        blocks: { orderBy: { order: "asc" } },
        _count: { select: { leads: true } },
      },
    });

    if (!page) return error("Pagina no encontrada", 404);
    return success(page);
  } catch (err) {
    console.error("[event-pages] GET by id error:", err);
    return error("Error al obtener pagina", 500);
  }
}

// PATCH /api/event-pages/[id] — update (admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;

    const page = await prisma.eventPage.update({ where: { id }, data });
    return success(page);
  } catch (err) {
    console.error("[event-pages] PATCH error:", err);
    return error("Error al actualizar pagina", 500);
  }
}

// DELETE /api/event-pages/[id] — delete (admin)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.eventPage.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    console.error("[event-pages] DELETE error:", err);
    return error("Error al eliminar pagina", 500);
  }
}
