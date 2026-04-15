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
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function estimateReadTime(excerpt: string | null): string {
  if (!excerpt) return "3 min";
  const words = excerpt.split(/\s+/).length;
  const minutes = Math.max(2, Math.ceil(words / 40));
  return `${minutes} min`;
}

export function BlogCards({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <section id="blog" className="section-py bg-void relative overflow-hidden">
        <div className="container-landing">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="section-label mb-5 block">
              Blog
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-heading mb-8">
              El camino se
              <br />
              <span className="text-accent">documenta</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-secondary/50 text-sm">
              Próximamente — nuevos artículos en camino.
            </motion.p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="section-py bg-void relative overflow-hidden">
      <div className="container-landing">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-14 md:mb-20"
        >
          <div>
            <motion.span variants={fadeUp} className="section-label mb-5 block">
              Blog
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-heading">
              El camino se
              <br />
              <span className="text-accent">documenta</span>
            </motion.h2>
          </div>
          <motion.div variants={fadeUp}>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-accent hover:text-accent-hover transition-colors group self-start sm:self-auto"
            >
              <span className="h-[1px] w-5 bg-accent/30 transition-all duration-500 group-hover:w-8 group-hover:bg-accent" />
              Ver todos
            </Link>
          </motion.div>
        </motion.div>

        {/* Posts grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6"
        >
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              variants={fadeUp}
              custom={i}
              className="group"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                {/* Image container */}
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
                      <div className="flex flex-col items-center gap-2">
                        <span className="font-display text-5xl font-bold text-white/[0.03] uppercase">
                          Blog
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-void/40 via-void/10 to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-700" />
                  {/* Corner accents */}
                  <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-accent/0 group-hover:border-accent/40 transition-all duration-700" />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-accent/0 group-hover:border-accent/40 transition-all duration-700" />
                  {/* Number overlay */}
                  <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="font-mono text-[0.5rem] text-accent/40 tracking-wider">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Content area */}
                <div className="pt-5 pb-1">
                  {/* Meta row */}
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

                  {/* Title */}
                  <h3 className="font-display text-lg sm:text-xl font-bold uppercase leading-[1.1] text-primary group-hover:text-accent transition-colors duration-500 mb-3">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-[0.82rem] text-secondary/45 leading-[1.75] line-clamp-2 mb-5">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read more */}
                  <motion.span
                    className="inline-flex items-center gap-2.5 text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-accent/40 group-hover:text-accent transition-colors duration-500"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <span className="h-[1px] w-0 bg-accent transition-all duration-600 group-hover:w-5" />
                    Leer artículo
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">&rarr;</span>
                  </motion.span>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
