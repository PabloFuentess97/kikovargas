import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/event-blocks/block-renderer";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const page = await prisma.eventPage.findUnique({
    where: { slug },
    include: {
      blocks: { orderBy: { order: "asc" } },
    },
  });

  if (!page || page.status !== "PUBLISHED") return notFound();

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* KV Brand header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-wider text-white">KIKO</span>
          <span className="text-sm font-bold tracking-wider text-[#c9a84c]">VARGAS</span>
        </div>
      </div>

      {/* Blocks */}
      <BlockRenderer
        blocks={page.blocks.map((b) => ({
          id: b.id,
          type: b.type,
          data: b.data as Record<string, unknown>,
          order: b.order,
          pageId: b.pageId,
        }))}
        pageId={page.id}
      />

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xs font-bold tracking-wider text-[#555]">KIKO</span>
          <span className="text-xs font-bold tracking-wider text-[#c9a84c]/50">VARGAS</span>
        </div>
        <p className="text-[0.65rem] text-[#333]">&copy; {new Date().getFullYear()} Kiko Vargas. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
