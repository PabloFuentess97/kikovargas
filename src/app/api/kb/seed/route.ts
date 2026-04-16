import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success } from "@/lib/api-response";
import { KB_CATEGORIES } from "@/app/(admin)/dashboard/knowledge/kb-content";

// POST /api/kb/seed — Seed the database with default KB content
// Only inserts records that don't already exist (safe to re-run)
export async function POST() {
  await requireAdmin();

  let categoriesCreated = 0;
  let articlesCreated = 0;

  for (let ci = 0; ci < KB_CATEGORIES.length; ci++) {
    const cat = KB_CATEGORIES[ci];

    // Upsert category (insert if missing, skip if exists)
    const existing = await prisma.kbCategory.findUnique({ where: { id: cat.id } });
    if (!existing) {
      await prisma.kbCategory.create({
        data: {
          id: cat.id,
          label: cat.label,
          icon: cat.icon,
          description: cat.description,
          sortOrder: ci,
        },
      });
      categoriesCreated++;
    }

    // Upsert articles
    for (let ai = 0; ai < cat.articles.length; ai++) {
      const art = cat.articles[ai];
      const articleId = `${cat.id}/${art.id}`;
      const existingArt = await prisma.kbArticle.findUnique({ where: { id: articleId } });
      if (!existingArt) {
        await prisma.kbArticle.create({
          data: {
            id: articleId,
            categoryId: cat.id,
            title: art.title,
            content: art.content,
            sortOrder: ai,
          },
        });
        articlesCreated++;
      }
    }
  }

  return success({
    seeded: true,
    categoriesCreated,
    articlesCreated,
    message:
      categoriesCreated === 0 && articlesCreated === 0
        ? "La base de datos ya esta sincronizada. No se crearon registros nuevos."
        : `Se crearon ${categoriesCreated} categorias y ${articlesCreated} articulos.`,
  });
}
