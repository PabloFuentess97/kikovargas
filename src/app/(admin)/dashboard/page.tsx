import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  Card, CardHeader,
  PageHeader, StatCard,
  PostStatusBadge, ContactStatusBadge, EmptyState,
} from "@/components/admin/ui";

export default async function DashboardPage() {
  const session = await requireAdmin();

  const [
    totalPosts, publishedPosts, draftPosts,
    totalContacts, pendingContacts,
    galleryImages, totalUsers,
    recentPosts, recentContacts,
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

  const greeting = getGreeting();

  return (
    <div className="admin-fade-in">
      <PageHeader title="Dashboard" subtitle={session.email} eyebrow={greeting} />

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Posts publicados"
          value={publishedPosts}
          sub={`${draftPosts} borradores · ${totalPosts} total`}
          href="/dashboard/posts"
          icon={<IconDoc />}
        />
        <StatCard
          label="Contactos pendientes"
          value={pendingContacts}
          sub={`${totalContacts} total`}
          href="/dashboard/contacts"
          accent={pendingContacts > 0}
          icon={<IconMail />}
        />
        <StatCard
          label="Galeria"
          value={galleryImages}
          sub="imagenes"
          href="/dashboard/gallery"
          icon={<IconImage />}
        />
        <StatCard
          label="Usuarios"
          value={totalUsers}
          sub="registrados"
          href="/dashboard/users"
          icon={<IconUsers />}
        />
      </div>

      {/* Recent activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent posts */}
        <Card className="overflow-hidden">
          <CardHeader
            title="Posts recientes"
            action={
              <Link href="/dashboard/posts" className="text-xs font-medium text-a-accent hover:text-a-accent-hover transition-colors">
                Ver todos &rarr;
              </Link>
            }
          />
          <div className="divide-y divide-border">
            {recentPosts.length === 0 ? (
              <EmptyState
                icon={<IconDoc />}
                message="No hay posts todavia"
                action={
                  <Link href="/dashboard/posts/new" className="text-xs font-medium text-a-accent hover:text-a-accent-hover">
                    Crear el primero &rarr;
                  </Link>
                }
              />
            ) : (
              recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/dashboard/posts/${post.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-card-hover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{post.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(post.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <PostStatusBadge status={post.status} />
                </Link>
              ))
            )}
          </div>
        </Card>

        {/* Recent contacts */}
        <Card className="overflow-hidden">
          <CardHeader
            title="Mensajes recientes"
            action={
              <Link href="/dashboard/contacts" className="text-xs font-medium text-a-accent hover:text-a-accent-hover transition-colors">
                Ver todos &rarr;
              </Link>
            }
          />
          <div className="divide-y divide-border">
            {recentContacts.length === 0 ? (
              <EmptyState icon={<IconMail />} message="No hay mensajes todavia" />
            ) : (
              recentContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/dashboard/contacts/${contact.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-card-hover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{contact.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{contact.subject}</p>
                  </div>
                  <ContactStatusBadge status={contact.status} />
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos dias";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function IconDoc() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
