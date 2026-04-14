import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AnalyticsCharts } from "./analytics-charts";

export default async function AnalyticsPage() {
  await requireAdmin();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalViews,
    todayViews,
    weekViews,
    monthViews,
    topPages,
    topCountries,
    deviceBreakdown,
    browserBreakdown,
    recentViews,
  ] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: today } } }),
    prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),

    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),

    prisma.pageView.groupBy({
      by: ["country"],
      where: { createdAt: { gte: thirtyDaysAgo }, country: { not: "" } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),

    prisma.pageView.groupBy({
      by: ["device"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),

    prisma.pageView.groupBy({
      by: ["browser"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),

    prisma.pageView.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Build daily chart data
  const dailyMap = new Map<string, number>();
  for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const view of recentViews) {
    const key = view.createdAt.toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  }
  const daily = Array.from(dailyMap, ([date, count]) => ({ date, count }));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-muted">Últimos 30 días de actividad</p>

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Hoy" value={todayViews} />
        <StatCard label="Últimos 7 días" value={weekViews} />
        <StatCard label="Últimos 30 días" value={monthViews} />
        <StatCard label="Total" value={totalViews} />
      </div>

      {/* Daily chart */}
      <div className="mt-8">
        <AnalyticsCharts daily={daily} />
      </div>

      {/* Tables grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Top pages */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold">Páginas más visitadas</h2>
          </div>
          <div className="divide-y divide-border">
            {topPages.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted">Sin datos todavía</p>
            )}
            {topPages.map((p) => (
              <div key={p.path} className="flex items-center justify-between px-5 py-2.5">
                <span className="truncate text-sm font-mono">{p.path}</span>
                <span className="shrink-0 ml-4 text-sm font-semibold">{p._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top countries */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold">Países</h2>
          </div>
          <div className="divide-y divide-border">
            {topCountries.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted">Sin datos de geolocalización</p>
            )}
            {topCountries.map((c) => (
              <div key={c.country} className="flex items-center justify-between px-5 py-2.5">
                <span className="text-sm">{c.country}</span>
                <span className="text-sm font-semibold">{c._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold">Dispositivos</h2>
          </div>
          <div className="p-5 space-y-3">
            {deviceBreakdown.length === 0 && (
              <p className="text-center text-sm text-muted">Sin datos</p>
            )}
            {deviceBreakdown.map((d) => {
              const pct = monthViews > 0 ? Math.round((d._count.id / monthViews) * 100) : 0;
              return (
                <div key={d.device}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize">{d.device || "desconocido"}</span>
                    <span className="text-muted">{d._count.id} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-a-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browsers */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold">Navegadores</h2>
          </div>
          <div className="p-5 space-y-3">
            {browserBreakdown.length === 0 && (
              <p className="text-center text-sm text-muted">Sin datos</p>
            )}
            {browserBreakdown.map((b) => {
              const pct = monthViews > 0 ? Math.round((b._count.id / monthViews) * 100) : 0;
              return (
                <div key={b.browser}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{b.browser || "desconocido"}</span>
                    <span className="text-muted">{b._count.id} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-a-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value.toLocaleString("es-MX")}</p>
    </div>
  );
}
