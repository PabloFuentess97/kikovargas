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
      <section className="pt-36 pb-20 md:pt-44 md:pb-28 bg-void relative overflow-hidden">
        {/* Ghost text */}
        <div
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 -right-[5%] font-display text-[20vw] font-bold uppercase leading-none text-white/[0.015] pointer-events-none select-none"
        >
          Blog
        </div>

        {/* Subtle grid pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="container-landing relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2.5 mb-10 text-[0.55rem] uppercase tracking-[0.25em]">
            <Link
              href="/"
              className="text-tertiary/60 hover:text-accent transition-colors duration-300"
            >
              Inicio
            </Link>
            <span className="text-tertiary/20">/</span>
            <span className="text-accent/50">Blog</span>
          </div>

          {/* Accent line */}
          <div className="w-10 h-[1px] bg-accent/50 mb-7" />

          <span className="section-label mb-5 block">Artículos</span>
          <h1
            className="font-display font-bold uppercase leading-[0.9] tracking-[-0.02em] text-primary max-w-3xl"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            El camino se{" "}
            <span className="text-accent">documenta</span>
          </h1>
          <p className="mt-8 text-secondary/50 text-base md:text-lg max-w-xl leading-[1.7] font-light">
            Reflexiones, estrategias y lecciones de más de 15 años en el
            bodybuilding competitivo.
          </p>

          {/* Post count */}
          {posts.length > 0 && (
            <div className="mt-10 flex items-center gap-3">
              <div className="w-6 h-[1px] bg-accent/30" />
              <span className="text-[0.55rem] uppercase tracking-[0.25em] text-tertiary/50">
                {posts.length} {posts.length === 1 ? "artículo" : "artículos"}
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="hr-accent" />

      {/* Posts grid */}
      <section className="section-py bg-surface relative overflow-hidden">
        <div className="container-landing">
          {posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-[1px] bg-accent/20 mx-auto mb-8" />
              <p className="font-display text-2xl font-bold uppercase text-secondary/20 mb-4">
                Próximamente
              </p>
              <p className="text-secondary/40 text-sm max-w-sm mx-auto leading-relaxed">
                Nuevos artículos en camino. Vuelve pronto para leer las últimas publicaciones.
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
