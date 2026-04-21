import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

export async function GET() {
  await requireAdmin();
  const templates = await prisma.dietTemplate.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return success({ templates });
}

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  meals: z.array(z.any()).default([]),
  notes: z.string().max(4000).optional(),
});

export async function POST(req: NextRequest) {
  await requireAdmin();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const tpl = await prisma.dietTemplate.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      category: parsed.data.category ?? "general",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meals: parsed.data.meals as any,
      notes: parsed.data.notes ?? "",
    },
  });
  return success(tpl, 201);
}
