import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { z } from "zod";

const BLOCK_TYPES = ["hero", "text", "image", "cta", "gallery", "form", "countdown", "faq"] as const;

const createBlockSchema = z.object({
  type: z.enum(BLOCK_TYPES),
  data: z.record(z.string(), z.unknown()),
});

const reorderSchema = z.object({
  blockIds: z.array(z.string()),
});

// POST /api/event-pages/[id]/blocks — add block (admin)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();

    // Handle reorder
    if (body.blockIds) {
      const parsed = reorderSchema.safeParse(body);
      if (!parsed.success) return error("IDs invalidos", 422);

      // Update order for each block
      await prisma.$transaction(
        parsed.data.blockIds.map((blockId, index) =>
          prisma.eventBlock.update({
            where: { id: blockId },
            data: { order: index },
          }),
        ),
      );

      const blocks = await prisma.eventBlock.findMany({
        where: { pageId: id },
        orderBy: { order: "asc" },
      });

      return success(blocks);
    }

    // Handle create
    const parsed = createBlockSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    // Get next order position
    const maxOrder = await prisma.eventBlock.findFirst({
      where: { pageId: id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const block = await prisma.eventBlock.create({
      data: {
        type: parsed.data.type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: parsed.data.data as any,
        order: (maxOrder?.order ?? -1) + 1,
        pageId: id,
      },
    });

    return success(block, 201);
  } catch (err) {
    console.error("[event-blocks] POST error:", err);
    return error("Error al crear bloque", 500);
  }
}
