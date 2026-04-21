import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const tasks = await prisma.clientTask.findMany({
    where: { clientId },
    orderBy: [{ completed: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return success({ tasks });
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(["DAILY", "WEEKLY", "GENERAL"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const client = await prisma.user.findFirst({ where: { id: clientId, role: "USER" }, select: { id: true } });
  if (!client) return error("Cliente no encontrado", 404);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const task = await prisma.clientTask.create({
    data: {
      clientId,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      category: parsed.data.category ?? "GENERAL",
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  return success(task, 201);
}
