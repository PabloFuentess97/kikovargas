import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardPage() {
  const session = await requireAdmin();

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalContacts,
    pendingContacts,
    galleryImages,
    totalUsers,
    recentPosts,
    recentContacts,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.contact.count(),
    prisma.contact.count({ where: { status: "PENDING" } }),
    prisma.image.count({ where: { gallery: true } }),
    prisma.user.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    prisma.contact.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, subject: true, status: true, createdAt: true },
    }),
  ]);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Bienvenido, {session.email}</p>
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Posts publicados" value={publishedPosts} sub={`${draftPosts} borradores · ${totalPosts} total`} href="/dashboard/posts" />
        <StatCard label="Contactos pendientes" value={pendingContacts} sub={`${totalContacts} total`} href="/dashboard/contacts" accent={pendingContacts > 0} />
        <StatCard label="Galería" value={galleryImages} sub="imágenes" href="/dashboard/gallery" />
        <StatCard label="Usuarios" value={totalUsers} sub={session.email} href="/dashboard/users" />
      </div>

      {/* Recent activity */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Recent posts */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold">Posts recientes</h2>
            <Link href="/dashboard/posts" className="text-xs text-a-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentPosts.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted">No hay posts todavía</p>
            )}
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/dashboard/posts/${post.id}`}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-card-hover"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{post.title}</p>
                  <p className="text-xs text-muted">
                    {new Date(post.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <StatusBadge status={post.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent contacts */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold">Mensajes recientes</h2>
            <Link href="/dashboard/contacts" className="text-xs text-a-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentContacts.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted">No hay mensajes todavía</p>
            )}
            {recentContacts.map((contact) => (
              <Link
                key={contact.id}
                href={`/dashboard/contacts/${contact.id}`}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-card-hover"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{contact.name}</p>
                  <p className="truncate text-xs text-muted">{contact.subject}</p>
                </div>
                <ContactBadge status={contact.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, href, accent }: {
  label: string; value: number; sub: string; href: string; accent?: boolean;
}) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-card-hover">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ? "text-warning" : ""}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{sub}</p>
    </Link>
  );
}

const POST_STATUS: Record<string, { text: string; className: string }> = {
  DRAFT: { text: "Borrador", className: "bg-warning/10 text-warning" },
  PUBLISHED: { text: "Publicado", className: "bg-success/10 text-success" },
  ARCHIVED: { text: "Archivado", className: "bg-muted/10 text-muted" },
};

function StatusBadge({ status }: { status: string }) {
  const badge = POST_STATUS[status] ?? POST_STATUS.DRAFT;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium ${badge.className}`}>
      {badge.text}
    </span>
  );
}

const CONTACT_STATUS: Record<string, { text: string; className: string }> = {
  PENDING: { text: "Pendiente", className: "bg-warning/10 text-warning" },
  READ: { text: "Leído", className: "bg-a-primary/10 text-a-primary" },
  REPLIED: { text: "Respondido", className: "bg-success/10 text-success" },
  ARCHIVED: { text: "Archivado", className: "bg-muted/10 text-muted" },
};

function ContactBadge({ status }: { status: string }) {
  const badge = CONTACT_STATUS[status] ?? CONTACT_STATUS.PENDING;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium ${badge.className}`}>
      {badge.text}
    </span>
  );
}
