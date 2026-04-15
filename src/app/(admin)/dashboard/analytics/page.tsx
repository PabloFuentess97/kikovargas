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

  const stats = [
    { label: "Hoy", value: todayViews, trend: null },
    { label: "7 dias", value: weekViews, trend: null },
    { label: "30 dias", value: monthViews, trend: null },
    { label: "Total", value: totalViews, trend: null },
  ];

  return (
    <div className="admin-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted">Ultimos 30 dias de actividad</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="admin-card p-5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">{s.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{s.value.toLocaleString("es-MX")}</p>
          </div>
        ))}
      </div>

      {/* Daily chart */}
      <div className="mt-6">
        <AnalyticsCharts daily={daily} />
      </div>

      {/* Tables grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top pages */}
        <div className="admin-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Paginas mas visitadas</h2>
          </div>
          <div className="divide-y divide-border">
            {topPages.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted">Sin datos todavia</p>
            )}
            {topPages.map((p, i) => (
              <div key={p.path} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-card-hover">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-a-accent-dim text-[0.6rem] font-bold text-a-accent">{i + 1}</span>
                  <span className="truncate text-sm font-mono">{p.path}</span>
                </div>
                <span className="shrink-0 ml-4 text-sm font-semibold tabular-nums">{p._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top countries */}
        <div className="admin-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Paises</h2>
          </div>
          <div className="divide-y divide-border">
            {topCountries.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted">Sin datos de geolocalizacion</p>
            )}
            {topCountries.map((c) => (
              <div key={c.country} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-card-hover">
                <span className="text-sm">{c.country}</span>
                <span className="text-sm font-semibold tabular-nums">{c._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="admin-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Dispositivos</h2>
          </div>
          <div className="p-5 space-y-4">
            {deviceBreakdown.length === 0 && (
              <p className="text-center text-sm text-muted">Sin datos</p>
            )}
            {deviceBreakdown.map((d) => {
              const pct = monthViews > 0 ? Math.round((d._count.id / monthViews) * 100) : 0;
              return (
                <div key={d.device}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="capitalize font-medium">{d.device || "desconocido"}</span>
                    <span className="text-muted tabular-nums">{d._count.id} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-a-accent transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browsers */}
        <div className="admin-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Navegadores</h2>
          </div>
          <div className="p-5 space-y-4">
            {browserBreakdown.length === 0 && (
              <p className="text-center text-sm text-muted">Sin datos</p>
            )}
            {browserBreakdown.map((b) => {
              const pct = monthViews > 0 ? Math.round((b._count.id / monthViews) * 100) : 0;
              return (
                <div key={b.browser}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{b.browser || "desconocido"}</span>
                    <span className="text-muted tabular-nums">{b._count.id} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-a-accent transition-all duration-500"
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
