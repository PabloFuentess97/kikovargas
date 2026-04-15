import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PostContent } from "./post-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, cover: { select: { url: true } } },
  });

  if (!post) return { title: "Post no encontrado" };

  return {
    title: `${post.title} | Kiko Vargas`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      images: post.cover?.url ? [post.cover.url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, email: true } },
      cover: { select: { url: true, alt: true } },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const authorName = post.author.name ?? post.author.email.split("@")[0];
  const publishDate = post.publishedAt ?? post.createdAt;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Cover image or fallback */}
        {post.cover?.url ? (
          <div className="relative h-[45vh] min-h-[320px] max-h-[550px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${post.cover.url}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void from-5% via-void/70 to-void/30" />
          </div>
        ) : (
          <div className="h-28 md:h-36 bg-void" />
        )}

        {/* Post header — overlaps image */}
        <div
          className={`container-landing relative z-10 ${
            post.cover?.url ? "-mt-32 md:-mt-40 pb-10 md:pb-14" : "pt-32 md:pt-40 pb-10 md:pb-14"
          }`}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-[0.55rem] uppercase tracking-[0.25em]">
            <Link
              href="/"
              className="text-tertiary hover:text-accent transition-colors duration-300"
            >
              Inicio
            </Link>
            <span className="text-tertiary/30">/</span>
            <Link
              href="/blog"
              className="text-tertiary hover:text-accent transition-colors duration-300"
            >
              Blog
            </Link>
            <span className="text-tertiary/30">/</span>
            <span className="text-accent/60 truncate max-w-[200px]">{post.title}</span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-5 text-[0.55rem] uppercase tracking-[0.2em] text-tertiary">
            <span>{authorName}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-tertiary" />
            <time dateTime={publishDate.toISOString()}>
              {new Intl.DateTimeFormat("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(publishDate)}
            </time>
          </div>

          {/* Title */}
          <h1
            className="font-display font-bold uppercase leading-[0.92] tracking-[-0.02em] text-primary max-w-4xl"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-5 text-secondary/60 text-base md:text-lg leading-relaxed max-w-2xl">
              {post.excerpt}
            </p>
          )}
        </div>
      </section>

      <div className="hr-accent" />

      {/* Article body */}
      <section className="bg-surface">
        <div className="container-landing py-14 md:py-20">
          <PostContent content={post.content} />

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-border-subtle">
            <Link
              href="/blog"
              className="inline-flex items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-accent/60 hover:text-accent transition-colors group"
            >
              <span className="text-base transition-transform duration-300 group-hover:-translate-x-1">
                &larr;
              </span>
              Volver al blog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
