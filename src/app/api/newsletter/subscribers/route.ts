import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// GET /api/newsletter/subscribers — admin: list subscribers
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status"); // "active" | "inactive" | null (all)
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const skip = (page - 1) * limit;

    const where = status === "active" ? { active: true }
      : status === "inactive" ? { active: false }
      : {};

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.subscriber.count({ where }),
    ]);

    const activeCount = await prisma.subscriber.count({ where: { active: true } });

    return success({ subscribers, total, activeCount, page, limit });
  } catch {
    return error("No autorizado", 403);
  }
}

// DELETE /api/newsletter/subscribers — admin: delete subscriber
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id } = body as { id: string };

    if (!id) return error("ID requerido", 400);

    await prisma.subscriber.delete({ where: { id } });
    return success({ deleted: true });
  } catch {
    return error("No autorizado", 403);
  }
}
