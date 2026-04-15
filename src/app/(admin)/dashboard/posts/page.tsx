import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { DeletePostButton } from "./delete-post-button";

const STATUS: Record<string, { text: string; dot: string; bg: string }> = {
  DRAFT: { text: "Borrador", dot: "bg-warning", bg: "bg-warning/10 text-warning" },
  PUBLISHED: { text: "Publicado", dot: "bg-success", bg: "bg-success/10 text-success" },
  ARCHIVED: { text: "Archivado", dot: "bg-muted", bg: "bg-muted/10 text-muted" },
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
    <div className="admin-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="mt-1 text-sm text-muted">{posts.length} entradas en el blog</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-a-accent px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-a-accent-hover active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo post
        </Link>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Titulo</th>
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Estado</th>
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted hidden sm:table-cell">Autor</th>
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted hidden md:table-cell">Fecha</th>
              <th className="px-5 py-3.5 text-right text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((post) => {
              const badge = STATUS[post.status] ?? STATUS.DRAFT;
              return (
                <tr key={post.id} className="transition-colors hover:bg-card-hover">
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/posts/${post.id}`} className="group">
                      <p className="font-medium group-hover:text-a-accent transition-colors">{post.title}</p>
                      <p className="mt-0.5 text-xs text-muted font-mono">/{post.slug}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-medium ${badge.bg}`}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted hidden sm:table-cell">{post.author.name}</td>
                  <td className="px-5 py-4 text-muted hidden md:table-cell">
                    {new Date(post.createdAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/posts/${post.id}`}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-all hover:text-foreground hover:border-a-accent/30 hover:bg-a-accent-dim"
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
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-a-accent-dim">
                      <svg className="h-6 w-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted">No hay posts todavia</p>
                    <Link href="/dashboard/posts/new" className="mt-2 text-xs font-medium text-a-accent hover:text-a-accent-hover">
                      Crea el primero &rarr;
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
