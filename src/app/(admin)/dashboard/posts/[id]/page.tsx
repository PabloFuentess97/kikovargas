import Link from "next/link";
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
    <div className="admin-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted mb-2">
          <Link href="/dashboard/posts" className="hover:text-a-accent transition-colors">Posts</Link>
          <span>/</span>
          <span>Editar</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar post</h1>
        <p className="mt-1 text-sm text-muted font-mono">/{post.slug}</p>
      </div>
      <div className="max-w-2xl">
        <PostForm post={post} />
      </div>
    </div>
  );
}
