import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// PATCH /api/kb/articles/:id — Update an article's title or content
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const body = await req.json();
  const { title, content } = body as { title?: string; content?: string };

  if (!title && !content) {
    return error("Debe proporcionar title o content", 422);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (content !== undefined) data.content = content;

  try {
    const article = await prisma.kbArticle.update({
      where: { id },
      data,
    });
    return success(article);
  } catch {
    return error("Articulo no encontrado", 404);
  }
}
