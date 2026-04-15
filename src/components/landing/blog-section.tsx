import { prisma } from "@/lib/db/prisma";
import { BlogCards } from "./blog-cards";

export async function BlogSection() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
      cover: { select: { url: true, alt: true } },
    },
  });

  return <BlogCards posts={posts} />;
}
