import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession, requireAdmin } from "@/lib/auth/session";
import { createPostSchema } from "@/lib/validations/post";
import { success, error } from "@/lib/api-response";

// GET /api/posts — admin sees all statuses, public sees only PUBLISHED
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
  const skip = (page - 1) * limit;

  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";

  // Public users can only see published posts
  const statusParam = searchParams.get("status");
  const where = isAdmin && statusParam
    ? { status: statusParam as "DRAFT" | "PUBLISHED" | "ARCHIVED" }
    : isAdmin
      ? {}
      : { status: "PUBLISHED" as const };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
        cover: { select: { id: true, url: true, alt: true } },
      },
      orderBy: isAdmin ? { createdAt: "desc" } : { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return success({ posts, total, page, limit });
}

// POST /api/posts — create post (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const { coverId, ...data } = parsed.data;

    // Check slug uniqueness
    const existing = await prisma.post.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return error("Ya existe un post con ese slug", 409);
    }

    const post = await prisma.post.create({
      data: {
        ...data,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        authorId: session.sub,
        coverId: coverId ?? null,
      },
    });

    return success(post, 201);
  } catch {
    return error("No autorizado", 403);
  }
}
