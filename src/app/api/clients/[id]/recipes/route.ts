import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// GET /api/clients/[id]/recipes — list recipes assigned to this client
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const assignments = await prisma.clientRecipe.findMany({
    where: { clientId },
    include: { recipe: true },
    orderBy: { assignedAt: "desc" },
  });

  return success({ assignments });
}

const postSchema = z.object({
  recipeIds: z.array(z.string()).min(1),
});

// POST /api/clients/[id]/recipes — assign recipes in bulk (idempotent via upsert)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const client = await prisma.user.findFirst({
    where: { id: clientId, role: "USER" },
    select: { id: true },
  });
  if (!client) return error("Cliente no encontrado", 404);

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  // Dedupe ids
  const uniqueIds = Array.from(new Set(parsed.data.recipeIds));

  // Validate recipes exist
  const existingRecipes = await prisma.recipe.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true },
  });
  const existingIds = new Set(existingRecipes.map((r) => r.id));

  // Upsert each assignment — unique index handles duplicates
  await Promise.all(
    uniqueIds
      .filter((rid) => existingIds.has(rid))
      .map((recipeId) =>
        prisma.clientRecipe.upsert({
          where: { clientId_recipeId: { clientId, recipeId } },
          create: { clientId, recipeId },
          update: {}, // no-op on conflict
        }),
      ),
  );

  const assignments = await prisma.clientRecipe.findMany({
    where: { clientId },
    include: { recipe: true },
    orderBy: { assignedAt: "desc" },
  });

  return success({ assignments }, 201);
}
