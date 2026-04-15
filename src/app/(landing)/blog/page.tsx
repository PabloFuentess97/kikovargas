import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { BlogGrid } from "./blog-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Kiko Vargas",
  description: "Artículos sobre bodybuilding, preparación de competencias, coaching y mentalidad.",
};

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
      cover: { select: { url: true, alt: true } },
    },
  });

  return (
    <>
      {/* Hero header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-void relative overflow-hidden">
        {/* Ghost text */}
        <div
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 -right-[5%] font-display text-[18vw] font-bold uppercase leading-none text-white/[0.012] pointer-events-none select-none"
        >
          Blog
        </div>

        <div className="container-landing">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-[0.55rem] uppercase tracking-[0.25em]">
            <Link
              href="/"
              className="text-tertiary hover:text-accent transition-colors duration-300"
            >
              Inicio
            </Link>
            <span className="text-tertiary/30">/</span>
            <span className="text-accent">Blog</span>
          </div>

          <span className="section-label mb-5 block">Artículos</span>
          <h1 className="section-heading">
            El camino se
            <br />
            <span className="text-accent">documenta</span>
          </h1>
          <p className="mt-6 text-secondary/60 text-sm max-w-lg leading-relaxed">
            Reflexiones, estrategias y lecciones de más de 15 años en el
            bodybuilding competitivo.
          </p>
        </div>
      </section>

      <div className="hr-accent" />

      {/* Posts grid */}
      <section className="section-py bg-surface relative overflow-hidden">
        <div className="container-landing">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-xl font-semibold uppercase text-secondary/30 mb-3">
                Próximamente
              </p>
              <p className="text-secondary/40 text-sm">
                Nuevos artículos en camino.
              </p>
            </div>
          ) : (
            <BlogGrid posts={posts} />
          )}
        </div>
      </section>
    </>
  );
}
