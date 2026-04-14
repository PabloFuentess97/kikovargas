import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession, requireAdmin } from "@/lib/auth/session";
import { updatePostSchema } from "@/lib/validations/post";
import { success, error } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

// GET /api/posts/:id — fetch by id or slug; public only sees PUBLISHED
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  // Support lookup by slug (slugs never look like cuid)
  const isSlug = !id.startsWith("c") || id.includes("-");
  const post = await prisma.post.findUnique({
    where: isSlug ? { slug: id } : { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      cover: true,
      images: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!post) return error("Post no encontrado", 404);

  // Non-admin users can only view published posts
  const session = await getSession();
  if (session?.role !== "ADMIN" && post.status !== "PUBLISHED") {
    return error("Post no encontrado", 404);
  }

  return success(post);
}

// PATCH /api/posts/:id (admin only)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = updatePostSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return error("Post no encontrado", 404);

    const data = parsed.data;

    // Check slug uniqueness if slug is being changed
    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.post.findUnique({ where: { slug: data.slug } });
      if (slugTaken) return error("Ya existe un post con ese slug", 409);
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...data,
        // Set publishedAt when transitioning to PUBLISHED
        ...(data.status === "PUBLISHED" && !existing.publishedAt
          ? { publishedAt: new Date() }
          : {}),
      },
    });

    return success(post);
  } catch {
    return error("No autorizado", 403);
  }
}

// DELETE /api/posts/:id (admin only)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return error("Post no encontrado", 404);

    await prisma.post.delete({ where: { id } });

    return success({ deleted: true });
  } catch {
    return error("No autorizado", 403);
  }
}
