import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

const schema = z.object({
  ids: z.array(z.string()).min(1),
});

// POST /api/images/reorder — reindex image order based on received ids (index = order)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return error(parsed.error.issues[0].message, 422);

    await prisma.$transaction(
      parsed.data.ids.map((id, idx) =>
        prisma.image.update({ where: { id }, data: { order: idx } }),
      ),
    );

    return success({ reordered: parsed.data.ids.length });
  } catch {
    return error("No autorizado", 403);
  }
}
