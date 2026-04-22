import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { DEFAULT_INACTIVE_ACCESS } from "@/lib/auth/client-access";

const CONFIG_KEY = "inactiveClientAccess";

// GET /api/inactive-client-access — read current flags
export async function GET() {
  await requireAdmin();

  const row = await prisma.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
  const current = (row?.value as Partial<Record<string, boolean>> | null) ?? {};

  return success({
    access: { ...DEFAULT_INACTIVE_ACCESS, ...current, home: true },
  });
}

const schema = z.object({
  home: z.boolean().optional(),
  workouts: z.boolean().optional(),
  tasks: z.boolean().optional(),
  diet: z.boolean().optional(),
  recipes: z.boolean().optional(),
  progress: z.boolean().optional(),
  documents: z.boolean().optional(),
  invoices: z.boolean().optional(),
});

// PATCH /api/inactive-client-access — update flags (merged with current)
export async function PATCH(req: NextRequest) {
  await requireAdmin();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const value = {
    ...DEFAULT_INACTIVE_ACCESS,
    ...parsed.data,
    home: true, // forzado siempre
  };

  await prisma.siteConfig.upsert({
    where: { key: CONFIG_KEY },
    create: { key: CONFIG_KEY, value },
    update: { value },
  });

  return success({ access: value });
}
