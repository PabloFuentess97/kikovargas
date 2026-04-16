import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// GET /api/kb/articles — Fetch all KB data (categories + articles)
export async function GET() {
  await requireAdmin();

  const [categories, articles] = await Promise.all([
    prisma.kbCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.kbArticle.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return success({ categories, articles });
}
