import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader, LinkButton } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function formatEuro(cents: number | null): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default async function AdminClientsPage() {
  await requireAdmin();

  const clients = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, phone: true, active: true,
      monthlyFee: true, startedAt: true, createdAt: true,
      _count: { select: { workouts: true, tasks: true, documents: true, diets: true, invoices: true } },
    },
  });

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Clientes"
        subtitle={`${clients.length} cliente${clients.length !== 1 ? "s" : ""} en total`}
        action={
          <div className="flex gap-2">
            <LinkButton href="/dashboard/clients/access-config" variant="secondary" size="md">
              Acceso inactivos
            </LinkButton>
            <LinkButton href="/dashboard/clients/new" size="md">
              + Nuevo cliente
            </LinkButton>
          </div>
        }
      />

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-a-accent/10">
            <svg className="h-7 w-7 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Sin clientes todavia</h3>
          <p className="text-sm text-muted mb-4">Crea tu primer cliente para empezar.</p>
          <LinkButton href="/dashboard/clients/new" size="md">+ Nuevo cliente</LinkButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/clients/${c.id}`}
              className="admin-card admin-card-interactive p-4 block group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-a-accent/10 text-a-accent text-sm font-semibold uppercase">
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate capitalize">{c.name}</p>
                  <p className="text-[0.7rem] text-muted truncate">{c.email}</p>
                </div>
                {!c.active && (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-medium bg-muted/10 text-muted">
                    Inactivo
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-border">
                <div>
                  <p className="text-base font-semibold text-foreground">{c._count.workouts}</p>
                  <p className="text-[0.55rem] uppercase tracking-wider text-muted">Entrenos</p>
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{c._count.tasks}</p>
                  <p className="text-[0.55rem] uppercase tracking-wider text-muted">Tareas</p>
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{c._count.invoices}</p>
                  <p className="text-[0.55rem] uppercase tracking-wider text-muted">Facturas</p>
                </div>
              </div>

              {c.monthlyFee !== null && (
                <p className="mt-3 text-[0.7rem] text-a-accent">{formatEuro(c.monthlyFee)}/mes</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
