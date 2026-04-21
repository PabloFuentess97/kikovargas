import Link from "next/link";
import { requireClientArea } from "@/lib/auth/client-access";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

function formatEuro(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(cents / 100);
}

export default async function ClientDashboardPage() {
  const { session, access } = await requireClientArea("home");

  // Only query what we'll actually display (respect permissions)
  const [user, activeWorkouts, openTasks, activeDiet, unpaidInvoices, docsCount, latestCheckIn] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: { name: true, startedAt: true, heightCm: true },
    }),
    access.allowedAreas.workouts
      ? prisma.workout.count({ where: { clientId: session.sub, status: "ACTIVE" } })
      : 0,
    access.allowedAreas.tasks
      ? prisma.clientTask.count({ where: { clientId: session.sub, completed: false } })
      : 0,
    access.allowedAreas.diet
      ? prisma.diet.findFirst({
          where: { clientId: session.sub, active: true },
          select: { title: true },
        })
      : null,
    access.allowedAreas.invoices
      ? prisma.invoice.findMany({
          where: { clientId: session.sub, status: { in: ["PENDING", "OVERDUE"] } },
          select: { id: true, amount: true, currency: true, dueDate: true },
        })
      : [],
    access.allowedAreas.documents
      ? prisma.clientDocument.count({ where: { clientId: session.sub } })
      : 0,
    access.allowedAreas.progress
      ? prisma.clientCheckIn.findFirst({
          where: { clientId: session.sub },
          orderBy: { date: "desc" },
          select: { weightKg: true, date: true },
        })
      : null,
  ]);

  const unpaidTotal = unpaidInvoices.reduce((s, i) => s + i.amount, 0);
  const unpaidCurrency = unpaidInvoices[0]?.currency ?? "EUR";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos dias" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="admin-fade-in">
      {/* Welcome header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-a-accent mb-1">{greeting}</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight capitalize">
          {user?.name?.split(" ")[0] ?? "Bienvenido"}
        </h1>
        {user?.startedAt && (
          <p className="mt-1 text-xs text-muted">
            Coaching desde {new Date(user.startedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Inactive account banner */}
      {!access.active && (
        <div className="mb-6 rounded-2xl border border-warning/25 bg-warning/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-warning/15">
              <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zM12 15.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Cuenta inactiva</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Tu periodo de coaching ha finalizado. Mantienes acceso a tus documentos
                y facturas. Contacta con Kiko si quieres retomar el entrenamiento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats grid — only show what's allowed */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {access.allowedAreas.workouts && (
          <Link href="/panel/entrenamientos" className="admin-card admin-card-interactive p-4 block group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">Entrenamientos</p>
              <Icon name="dumbbell" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{activeWorkouts}</p>
            <p className="mt-0.5 text-[0.7rem] text-muted">activos</p>
          </Link>
        )}

        {access.allowedAreas.tasks && (
          <Link href="/panel/checklist" className="admin-card admin-card-interactive p-4 block group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">Tareas</p>
              <Icon name="check" />
            </div>
            <p className={`text-2xl font-bold tracking-tight ${openTasks > 0 ? "text-warning" : ""}`}>{openTasks}</p>
            <p className="mt-0.5 text-[0.7rem] text-muted">pendientes</p>
          </Link>
        )}

        {access.allowedAreas.diet && (
          <Link href="/panel/dieta" className="admin-card admin-card-interactive p-4 block group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">Dieta</p>
              <Icon name="diet" />
            </div>
            <p className="text-sm font-semibold truncate">{activeDiet?.title ?? "Sin dieta activa"}</p>
            <p className="mt-0.5 text-[0.7rem] text-muted">plan actual</p>
          </Link>
        )}

        {access.allowedAreas.invoices && (
          <Link href="/panel/facturas" className="admin-card admin-card-interactive p-4 block group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">Por pagar</p>
              <Icon name="receipt" />
            </div>
            <p className={`text-2xl font-bold tracking-tight ${unpaidTotal > 0 ? "text-warning" : ""}`}>
              {unpaidTotal > 0 ? formatEuro(unpaidTotal, unpaidCurrency) : "—"}
            </p>
            <p className="mt-0.5 text-[0.7rem] text-muted">{unpaidInvoices.length} facturas</p>
          </Link>
        )}

        {access.allowedAreas.progress && (
          <Link href="/panel/progreso" className="admin-card admin-card-interactive p-4 block group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">Peso</p>
              <svg className="h-4 w-4 text-muted group-hover:text-a-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {latestCheckIn?.weightKg ? `${latestCheckIn.weightKg}` : "—"}<span className="text-sm text-muted ml-1">kg</span>
            </p>
            <p className="mt-0.5 text-[0.7rem] text-muted">
              {latestCheckIn ? new Date(latestCheckIn.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "sin check-in"}
            </p>
          </Link>
        )}
      </div>

      {/* Quick actions — only show what's allowed */}
      {(access.allowedAreas.workouts || access.allowedAreas.documents || access.allowedAreas.invoices) && (
        <>
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-3">Accesos rapidos</h2>
          <div className="space-y-2">
            {access.allowedAreas.workouts && (
              <Link
                href="/panel/entrenamientos"
                className="flex items-center gap-3 px-4 h-[56px] rounded-xl bg-card border border-border active:bg-card-hover active:scale-[0.99] transition-all"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-a-accent/10 text-a-accent">
                  <Icon name="dumbbell" large />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Mis entrenamientos</p>
                  <p className="text-[0.7rem] text-muted">Rutinas asignadas por Kiko</p>
                </div>
                <span className="text-muted">→</span>
              </Link>
            )}

            {access.allowedAreas.documents && (
              <Link
                href="/panel/documentos"
                className="flex items-center gap-3 px-4 h-[56px] rounded-xl bg-card border border-border active:bg-card-hover active:scale-[0.99] transition-all"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-a-accent/10 text-a-accent">
                  <Icon name="docs" large />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Mis documentos</p>
                  <p className="text-[0.7rem] text-muted">{docsCount} documento{docsCount !== 1 ? "s" : ""} compartido{docsCount !== 1 ? "s" : ""}</p>
                </div>
                <span className="text-muted">→</span>
              </Link>
            )}

            {access.allowedAreas.invoices && (
              <Link
                href="/panel/facturas"
                className="flex items-center gap-3 px-4 h-[56px] rounded-xl bg-card border border-border active:bg-card-hover active:scale-[0.99] transition-all"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-a-accent/10 text-a-accent">
                  <Icon name="receipt" large />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Mis facturas</p>
                  <p className="text-[0.7rem] text-muted">Historial de pagos</p>
                </div>
                <span className="text-muted">→</span>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* Inline icons */
function Icon({ name, large }: { name: "dumbbell" | "check" | "diet" | "receipt" | "docs"; large?: boolean }) {
  const size = large ? "h-5 w-5" : "h-4 w-4";
  const props = { className: `${size} text-muted group-hover:text-a-accent transition-colors`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" as const, strokeWidth: 1.6 };

  switch (name) {
    case "dumbbell":
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 3v18M18 3v18M3 7.5h3m0 9H3m15-9h3m-3 9h3M6 12h12" /></svg>;
    case "check":
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case "diet":
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21M3.375 11.25h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
    case "receipt":
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>;
    case "docs":
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
  }
}
