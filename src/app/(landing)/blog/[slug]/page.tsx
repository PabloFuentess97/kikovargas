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
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(publishDate);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Cover image or fallback */}
        {post.cover?.url ? (
          <div className="relative h-[50vh] min-h-[380px] max-h-[600px]">
            <div
              className="absolute inset-0 bg-cover bg-center scale-[1.02]"
              style={{ backgroundImage: `url('${post.cover.url}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void from-[8%] via-void/75 via-50% to-void/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-void/40 via-transparent to-transparent" />
            {/* Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.4)]" />
          </div>
        ) : (
          <div className="h-32 md:h-40 bg-void" />
        )}

        {/* Post header — overlaps cover */}
        <div
          className={`container-landing relative z-10 ${
            post.cover?.url ? "-mt-36 md:-mt-44 pb-12 md:pb-16" : "pt-32 md:pt-40 pb-12 md:pb-16"
          }`}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2.5 mb-8 text-[0.55rem] uppercase tracking-[0.25em]">
            <Link
              href="/"
              className="text-tertiary/60 hover:text-accent transition-colors duration-300"
            >
              Inicio
            </Link>
            <span className="text-tertiary/20">/</span>
            <Link
              href="/blog"
              className="text-tertiary/60 hover:text-accent transition-colors duration-300"
            >
              Blog
            </Link>
            <span className="text-tertiary/20">/</span>
            <span className="text-accent/50 truncate max-w-[180px]">{post.title}</span>
          </div>

          {/* Accent line */}
          <div className="w-10 h-[1px] bg-accent/50 mb-7" />

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6 text-[0.55rem] uppercase tracking-[0.2em] text-tertiary/70">
            <span className="text-accent/60 font-semibold">{authorName}</span>
            <span className="w-[3px] h-[3px] rounded-full bg-accent/20" />
            <time dateTime={publishDate.toISOString()}>
              {formattedDate}
            </time>
          </div>

          {/* Title */}
          <h1
            className="font-display font-bold uppercase leading-[0.9] tracking-[-0.02em] text-primary max-w-4xl"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)" }}
          >
            {post.title}
          </h1>

          {/* Excerpt as lead paragraph */}
          {post.excerpt && (
            <p className="mt-7 text-secondary/55 text-lg md:text-xl leading-[1.7] max-w-2xl font-light">
              {post.excerpt}
            </p>
          )}
        </div>
      </section>

      <div className="hr-accent" />

      {/* Article body */}
      <section className="bg-surface">
        <div className="container-landing py-16 md:py-24">
          <PostContent content={post.content} />

          {/* Article footer */}
          <div className="mx-auto max-w-3xl mt-20 pt-10 border-t border-border-subtle">
            {/* Author attribution */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-xs font-bold text-accent uppercase">
                  {authorName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-primary capitalize">{authorName}</p>
                <p className="text-[0.65rem] text-tertiary uppercase tracking-[0.15em]">
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-accent/50 hover:text-accent transition-colors group"
            >
              <span className="text-base transition-transform duration-300 group-hover:-translate-x-1.5">
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
