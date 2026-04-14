import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { PostForm } from "../post-form";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, excerpt: true, content: true, status: true },
  });

  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Editar post</h1>
      <p className="mt-1 text-sm text-muted">/{post.slug}</p>
      <div className="mt-8 max-w-2xl">
        <PostForm post={post} />
      </div>
    </div>
  );
}
