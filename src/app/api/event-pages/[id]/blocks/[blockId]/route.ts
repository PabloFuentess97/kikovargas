import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { z } from "zod";
const updateBlockSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

// PATCH /api/event-pages/[id]/blocks/[blockId] — update block data (admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> },
) {
  try {
    await requireAdmin();
    const { blockId } = await params;

    const body = await req.json();
    const parsed = updateBlockSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const block = await prisma.eventBlock.update({
      where: { id: blockId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { data: parsed.data.data as any },
    });

    return success(block);
  } catch (err) {
    console.error("[event-blocks] PATCH error:", err);
    return error("Error al actualizar bloque", 500);
  }
}

// DELETE /api/event-pages/[id]/blocks/[blockId] — delete block (admin)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> },
) {
  try {
    await requireAdmin();
    const { id, blockId } = await params;

    await prisma.eventBlock.delete({ where: { id: blockId } });

    // Reorder remaining blocks
    const remaining = await prisma.eventBlock.findMany({
      where: { pageId: id },
      orderBy: { order: "asc" },
    });

    await prisma.$transaction(
      remaining.map((block, index) =>
        prisma.eventBlock.update({
          where: { id: block.id },
          data: { order: index },
        }),
      ),
    );

    return success({ deleted: true });
  } catch (err) {
    console.error("[event-blocks] DELETE error:", err);
    return error("Error al eliminar bloque", 500);
  }
}
