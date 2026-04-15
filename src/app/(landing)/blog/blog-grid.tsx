"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";

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
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={stagger}
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-5"
    >
      {posts.map((post) => (
        <motion.article key={post.id} variants={fadeUp} className="group">
          <Link href={`/blog/${post.slug}`} className="block">
            {/* Image */}
            <div className="aspect-[16/10] overflow-hidden bg-elevated mb-5 relative">
              {post.cover?.url ? (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                    style={{ backgroundImage: `url('${post.cover.url}')` }}
                  />
                  <div className="absolute inset-0 bg-void/15 group-hover:bg-void/5 transition-colors duration-500" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-elevated">
                  <span className="font-display text-4xl font-bold text-white/[0.04] uppercase">
                    Blog
                  </span>
                </div>
              )}
              {/* Corner accents on hover */}
              <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t border-l border-accent/0 group-hover:border-accent/30 transition-colors duration-500" />
              <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b border-r border-accent/0 group-hover:border-accent/30 transition-colors duration-500" />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2.5 mb-3 text-[0.55rem] uppercase tracking-[0.2em] text-tertiary">
              <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-tertiary" />
              <span>{estimateReadTime(post.excerpt)}</span>
            </div>

            {/* Title */}
            <h2 className="font-display text-base sm:text-lg font-semibold uppercase leading-[1.15] text-primary group-hover:text-accent transition-colors duration-400 mb-2.5">
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-[0.8rem] text-secondary/50 leading-relaxed line-clamp-3 mb-4">
                {post.excerpt}
              </p>
            )}

            {/* Read more */}
            <span className="inline-flex items-center gap-2 text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-accent/50 group-hover:text-accent transition-colors duration-400">
              <span className="h-[1px] w-0 bg-accent transition-all duration-500 group-hover:w-4" />
              Leer más
            </span>
          </Link>
        </motion.article>
      ))}
    </motion.div>
  );
}
