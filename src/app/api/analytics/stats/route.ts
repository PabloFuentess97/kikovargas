import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
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
      dailyViews,
    ] = await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.count({ where: { createdAt: { gte: today } } }),
      prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),

      // Top pages (last 30 days)
      prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      // Top countries (last 30 days)
      prisma.pageView.groupBy({
        by: ["country"],
        where: { createdAt: { gte: thirtyDaysAgo }, country: { not: "" } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      // Device breakdown (last 30 days)
      prisma.pageView.groupBy({
        by: ["device"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      // Browser breakdown (last 30 days)
      prisma.pageView.groupBy({
        by: ["browser"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      // Daily views for last 30 days (raw data, aggregated on server)
      prisma.pageView.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Aggregate daily views into { date, count } pairs
    const dailyMap = new Map<string, number>();
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      dailyMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const view of dailyViews) {
      const key = view.createdAt.toISOString().slice(0, 10);
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }
    const daily = Array.from(dailyMap, ([date, count]) => ({ date, count }));

    return success({
      total: totalViews,
      today: todayViews,
      week: weekViews,
      month: monthViews,
      topPages: topPages.map((p) => ({ path: p.path, views: p._count.id })),
      topCountries: topCountries.map((c) => ({ country: c.country, views: c._count.id })),
      devices: deviceBreakdown.map((d) => ({ device: d.device, views: d._count.id })),
      browsers: browserBreakdown.map((b) => ({ browser: b.browser, views: b._count.id })),
      daily,
    });
  } catch {
    return error("No autorizado", 403);
  }
}
