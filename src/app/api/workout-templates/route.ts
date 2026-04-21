import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

export async function GET() {
  await requireAdmin();
  const templates = await prisma.workoutTemplate.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return success({ templates });
}

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  weekDay: z.number().int().min(0).max(6).optional().nullable(),
  exercises: z.array(z.any()).default([]),
});

export async function POST(req: NextRequest) {
  await requireAdmin();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const tpl = await prisma.workoutTemplate.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      category: parsed.data.category ?? "general",
      weekDay: parsed.data.weekDay ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exercises: parsed.data.exercises as any,
    },
  });
  return success(tpl, 201);
}
