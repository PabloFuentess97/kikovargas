import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { DeletePostButton } from "./delete-post-button";

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  DRAFT: { text: "Borrador", className: "bg-yellow-100 text-yellow-800" },
  PUBLISHED: { text: "Publicado", className: "bg-green-100 text-green-800" },
  ARCHIVED: { text: "Archivado", className: "bg-gray-100 text-gray-600" },
};

export default async function PostsPage() {
  await requireAdmin();

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="mt-1 text-sm text-muted">{posts.length} entradas</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Nuevo post
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left font-medium text-muted">Título</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Autor</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Fecha</th>
              <th className="px-4 py-3 text-right font-medium text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const badge = STATUS_LABELS[post.status] ?? STATUS_LABELS.DRAFT;
              return (
                <tr key={post.id} className="border-b border-border last:border-0 hover:bg-card/50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/posts/${post.id}`} className="font-medium hover:underline">
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{post.author.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(post.createdAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/posts/${post.id}`}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-card"
                      >
                        Editar
                      </Link>
                      <DeletePostButton postId={post.id} postTitle={post.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  No hay posts todavía.{" "}
                  <Link href="/dashboard/posts/new" className="text-primary hover:underline">
                    Crea el primero
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
