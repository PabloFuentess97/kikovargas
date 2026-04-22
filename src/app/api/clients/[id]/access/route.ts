import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { ALL_AREAS, type ClientArea } from "@/lib/auth/client-access";

// GET /api/clients/[id]/access — returns the user's override (or null)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: { id, role: "USER" },
    select: { allowedAreas: true },
  });
  if (!user) return error("Cliente no encontrado", 404);

  return success({
    allowedAreas: (user.allowedAreas as Record<string, boolean> | null) ?? null,
  });
}

const areasSchema = z.record(z.string(), z.boolean()).nullable();
const patchSchema = z.object({
  allowedAreas: areasSchema,
});

// PATCH /api/clients/[id]/access — set or clear override
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const client = await prisma.user.findFirst({
    where: { id, role: "USER" },
    select: { id: true },
  });
  if (!client) return error("Cliente no encontrado", 404);

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  let value: Record<ClientArea, boolean> | null = null;

  if (parsed.data.allowedAreas !== null) {
    // Normalize: keep only known keys, force home: true
    const input = parsed.data.allowedAreas;
    const normalized = {} as Record<ClientArea, boolean>;
    for (const area of ALL_AREAS) {
      normalized[area] = Boolean(input[area]);
    }
    normalized.home = true;
    value = normalized;
  }

  await prisma.user.update({
    where: { id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { allowedAreas: (value as any) ?? null },
  });

  return success({ allowedAreas: value });
}
