"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

export function PostContent({ content }: { content: string }) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="prose-landing mx-auto max-w-3xl"
    >
      {content.split("\n").map((paragraph, i) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        // Heading patterns: lines starting with ## or #
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="font-display text-xl md:text-2xl font-bold uppercase text-primary mt-12 mb-5 tracking-tight"
            >
              {trimmed.replace(/^##\s*/, "")}
            </h2>
          );
        }

        if (trimmed.startsWith("# ")) {
          return (
            <h2
              key={i}
              className="font-display text-2xl md:text-3xl font-bold uppercase text-primary mt-14 mb-6 tracking-tight"
            >
              {trimmed.replace(/^#\s*/, "")}
            </h2>
          );
        }

        // Bold line (used as sub-heading)
        if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
          return (
            <h3
              key={i}
              className="font-display text-lg font-semibold uppercase text-primary/90 mt-8 mb-3"
            >
              {trimmed.replace(/^\*\*|\*\*$/g, "")}
            </h3>
          );
        }

        // List items
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          return (
            <div key={i} className="flex gap-3 my-2 ml-1">
              <span className="text-accent mt-1.5 text-[0.5rem]">&#9670;</span>
              <p className="text-secondary/70 text-[0.95rem] leading-[1.9]">
                {trimmed.replace(/^[-•]\s*/, "")}
              </p>
            </div>
          );
        }

        // Blockquote
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-accent/30 pl-5 my-8 italic text-secondary/50 text-[0.95rem] leading-[1.9]"
            >
              {trimmed.replace(/^>\s*/, "")}
            </blockquote>
          );
        }

        // Regular paragraph
        return (
          <p
            key={i}
            className="text-secondary/70 text-[0.95rem] leading-[1.9] mb-5"
          >
            {trimmed}
          </p>
        );
      })}
    </motion.article>
  );
}
