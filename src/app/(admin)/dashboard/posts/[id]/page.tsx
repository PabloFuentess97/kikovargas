import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { PostForm } from "../post-form";
import { PageHeader } from "@/components/admin/ui";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true, title: true, slug: true, excerpt: true, content: true, status: true,
      coverId: true, cover: { select: { url: true, alt: true } },
    },
  });

  if (!post) notFound();

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Editar post"
        subtitle={`/${post.slug}`}
        breadcrumb={[
          { label: "Posts", href: "/dashboard/posts" },
          { label: "Editar" },
        ]}
      />
      <div className="max-w-2xl">
        <PostForm post={post} />
      </div>
    </div>
  );
}
