"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, stagger, ease } from "@/lib/animations";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  cover: { url: string; alt: string | null } | null;
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function estimateReadTime(excerpt: string | null): string {
  if (!excerpt) return "3 min";
  const words = excerpt.split(/\s+/).length;
  const minutes = Math.max(2, Math.ceil(words / 40));
  return `${minutes} min`;
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  // First post gets featured layout, rest in grid
  const [featured, ...rest] = posts;

  return (
    <div className="space-y-8">
      {/* Featured post — large card */}
      {featured && (
        <motion.article
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease }}
          className="group"
        >
          <Link href={`/blog/${featured.slug}`} className="grid md:grid-cols-2 gap-0 bg-elevated/50 overflow-hidden border border-border-subtle hover:border-accent/10 transition-colors duration-700">
            {/* Image */}
            <div className="aspect-[16/10] md:aspect-auto md:min-h-[360px] overflow-hidden relative">
              {featured.cover?.url ? (
                <img
                  src={featured.cover.url}
                  alt={featured.cover.alt || featured.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.05]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-elevated">
                  <span className="font-display text-6xl font-bold text-white/[0.03] uppercase">Blog</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-void/30 md:to-elevated/80" />
              <div className="absolute inset-0 bg-void/20 group-hover:bg-void/5 transition-colors duration-700" />
              {/* Corner accent */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-accent/0 group-hover:border-accent/30 transition-all duration-700" />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-8 md:p-10 lg:p-14">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="h-[1px] w-5 bg-accent/40" />
                <span className="text-[0.55rem] uppercase tracking-[0.25em] text-accent/70 font-semibold">
                  Último artículo
                </span>
              </div>

              <div className="flex items-center gap-2.5 mb-4 text-[0.55rem] uppercase tracking-[0.2em] text-tertiary">
                <span>{formatDate(featured.publishedAt ?? featured.createdAt)}</span>
                <span className="w-[3px] h-[3px] rounded-full bg-tertiary/50" />
                <span>{estimateReadTime(featured.excerpt)} lectura</span>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-bold uppercase leading-[1.05] text-primary group-hover:text-accent transition-colors duration-500 mb-4">
                {featured.title}
              </h2>

              {featured.excerpt && (
                <p className="text-[0.875rem] text-secondary/50 leading-[1.8] line-clamp-3 mb-7">
                  {featured.excerpt}
                </p>
              )}

              <span className="inline-flex items-center gap-2.5 text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-accent/50 group-hover:text-accent transition-colors duration-500">
                <span className="h-[1px] w-0 bg-accent transition-all duration-600 group-hover:w-5" />
                Leer artículo
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">&rarr;</span>
              </span>
            </div>
          </Link>
        </motion.article>
      )}

      {/* Rest of posts — standard grid */}
      {rest.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6"
        >
          {rest.map((post, i) => (
            <motion.article key={post.id} variants={fadeUp} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden bg-elevated relative">
                  {post.cover?.url ? (
                    <img
                      src={post.cover.url}
                      alt={post.cover.alt || post.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-elevated">
                      <span className="font-display text-5xl font-bold text-white/[0.03] uppercase">Blog</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-void/40 via-void/10 to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-700" />
                  <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-accent/0 group-hover:border-accent/40 transition-all duration-700" />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-accent/0 group-hover:border-accent/40 transition-all duration-700" />
                  <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="font-mono text-[0.5rem] text-accent/40 tracking-wider">
                      {String(i + 2).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-5 pb-1">
                  <div className="flex items-center gap-2.5 mb-3.5">
                    <span className="h-[1px] w-4 bg-accent/30 group-hover:w-6 group-hover:bg-accent/60 transition-all duration-500" />
                    <span className="text-[0.55rem] uppercase tracking-[0.2em] text-tertiary">
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </span>
                    <span className="w-[3px] h-[3px] rounded-full bg-tertiary/50" />
                    <span className="text-[0.55rem] uppercase tracking-[0.2em] text-tertiary">
                      {estimateReadTime(post.excerpt)} lectura
                    </span>
                  </div>

                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase leading-[1.1] text-primary group-hover:text-accent transition-colors duration-500 mb-3">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-[0.82rem] text-secondary/45 leading-[1.75] line-clamp-2 mb-5">
                      {post.excerpt}
                    </p>
                  )}

                  <span className="inline-flex items-center gap-2.5 text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-accent/40 group-hover:text-accent transition-colors duration-500">
                    <span className="h-[1px] w-0 bg-accent transition-all duration-600 group-hover:w-5" />
                    Leer artículo
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">&rarr;</span>
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      )}
    </div>
  );
}
