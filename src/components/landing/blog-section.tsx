"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";

const BLOG_POSTS = [
  {
    slug: "preparacion-competencia-2024",
    title: "Mi preparación para la competencia 2024",
    excerpt: "Cada prep es diferente. Este año decidí cambiar completamente mi enfoque nutricional y los resultados fueron brutales.",
    date: "15 Mar 2024",
    image: "/images/blog-1.jpg",
    category: "Preparación",
    readTime: "8 min",
  },
  {
    slug: "mentalidad-campeon",
    title: "La mentalidad de un campeón se entrena",
    excerpt: "El 80% de este deporte es mental. Te cuento las 3 cosas que cambiaron mi carrera para siempre.",
    date: "28 Feb 2024",
    image: "/images/blog-2.jpg",
    category: "Mindset",
    readTime: "6 min",
  },
  {
    slug: "errores-principiantes",
    title: "5 errores que destruyen tu progreso",
    excerpt: "Después de preparar más de 200 atletas, estos son los patrones que veo repetirse una y otra vez.",
    date: "10 Feb 2024",
    image: "/images/blog-3.jpg",
    category: "Coaching",
    readTime: "5 min",
  },
];

export function BlogSection() {
  return (
    <section id="blog" className="section-py bg-void relative overflow-hidden">
      <div className="container-landing">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-12 md:mb-16 lg:mb-20"
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
          <motion.a
            variants={fadeUp}
            href="/blog"
            className="inline-flex items-center gap-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-accent hover:text-accent-hover transition-colors group self-start sm:self-auto"
          >
            <span className="h-[1px] w-5 bg-accent/30 transition-all duration-500 group-hover:w-8 group-hover:bg-accent" />
            Ver todos
          </motion.a>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-4"
        >
          {BLOG_POSTS.map((post) => (
            <motion.article
              key={post.slug}
              variants={fadeUp}
              className="group cursor-pointer"
            >
              <div className="aspect-[16/10] overflow-hidden bg-elevated mb-5 relative">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url('${post.image}')` }}
                />
                <div className="absolute inset-0 bg-void/15 group-hover:bg-void/5 transition-colors duration-500" />
                <div className="absolute top-3 left-3">
                  <span className="bg-void/70 backdrop-blur-md text-[0.5rem] font-semibold uppercase tracking-[0.25em] text-accent px-2.5 py-1 border border-accent/15">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 mb-3 text-[0.55rem] uppercase tracking-[0.2em] text-tertiary">
                <span>{post.date}</span>
                <span className="w-0.5 h-0.5 rounded-full bg-tertiary" />
                <span>{post.readTime}</span>
              </div>

              <h3 className="font-display text-base sm:text-lg font-semibold uppercase leading-[1.15] text-primary group-hover:text-accent transition-colors duration-400 mb-2.5">
                {post.title}
              </h3>

              <p className="text-[0.8rem] text-secondary/50 leading-relaxed line-clamp-2 mb-4">
                {post.excerpt}
              </p>

              <span className="inline-flex items-center gap-2 text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-accent/50 group-hover:text-accent transition-colors duration-400">
                <span className="h-[1px] w-0 bg-accent transition-all duration-500 group-hover:w-4" />
                Leer más
              </span>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
