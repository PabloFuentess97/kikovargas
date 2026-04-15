import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/ui";
import { NewsletterManager } from "./newsletter-manager";

export default async function NewsletterPage() {
  await requireAdmin();

  const [campaigns, posts, activeCount] = await Promise.all([
    prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true, cover: { select: { url: true } } },
      orderBy: { publishedAt: "desc" },
      take: 20,
    }),
    prisma.subscriber.count({ where: { active: true } }),
  ]);

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Newsletter"
        subtitle={`${activeCount} suscriptores activos`}
      />
      <NewsletterManager
        initialCampaigns={campaigns}
        posts={posts}
        activeSubscribers={activeCount}
      />
    </div>
  );
}
