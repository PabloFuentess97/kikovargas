"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";

export function PostContent({ content }: { content: string }) {
  // Detect if content is HTML (from TipTap) or plain text (legacy)
  const isHtml = content.trimStart().startsWith("<");

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="mx-auto max-w-3xl"
    >
      {/* Drop cap indicator */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-[1px] bg-accent/40" />
        <span className="text-[0.5rem] uppercase tracking-[0.3em] text-tertiary/60">
          Articulo
        </span>
        <div className="flex-1 h-[1px] bg-border-subtle" />
      </div>

      <motion.div variants={fadeUp}>
        {isHtml ? (
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <LegacyContent content={content} />
        )}
      </motion.div>

      {/* End mark */}
      <div className="flex items-center justify-center gap-3 mt-16">
        <div className="w-12 h-[1px] bg-accent/20" />
        <span className="text-accent/30 text-xs">&#9670;</span>
        <div className="w-12 h-[1px] bg-accent/20" />
      </div>
    </motion.article>
  );
}

/* ─── Legacy plain-text renderer (backward compat) ── */

function LegacyContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let keyIdx = 0;

  function flushList() {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={`list-${keyIdx++}`} className="my-6 ml-1 space-y-3">
        {listBuffer.map((item, j) => (
          <li key={j} className="flex gap-3.5 items-start">
            <span className="text-accent mt-[0.6rem] text-[0.45rem] shrink-0">
              &#9670;
            </span>
            <span className="text-secondary/70 text-[0.95rem] md:text-base leading-[1.85]">
              {item}
            </span>
          </li>
        ))}
      </ul>,
    );
    listBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) { flushList(); continue; }

    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      listBuffer.push(trimmed.replace(/^[-•]\s*/, ""));
      continue;
    }
    flushList();

    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={`h1-${keyIdx++}`} className="font-display text-2xl md:text-3xl font-bold uppercase text-primary mt-16 mb-6 tracking-[-0.01em] leading-[1.1]">
          <span className="inline-block w-8 h-[2px] bg-accent/50 mr-4 align-middle" />
          {trimmed.replace(/^#\s*/, "")}
        </h2>,
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${keyIdx++}`} className="font-display text-xl md:text-2xl font-bold uppercase text-primary mt-14 mb-5 tracking-[-0.01em] leading-[1.15]">
          <span className="inline-block w-6 h-[2px] bg-accent/40 mr-3 align-middle" />
          {trimmed.replace(/^##\s*/, "")}
        </h2>,
      );
      continue;
    }
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      elements.push(
        <h3 key={`h3-${keyIdx++}`} className="font-display text-lg md:text-xl font-semibold uppercase text-primary/90 mt-10 mb-4 tracking-tight">
          {trimmed.replace(/^\*\*|\*\*$/g, "")}
        </h3>,
      );
      continue;
    }
    if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote key={`bq-${keyIdx++}`} className="relative my-10 pl-7 py-1 border-l-[2px] border-accent/30">
          <p className="italic text-secondary/55 text-base md:text-lg leading-[1.85] font-light">
            {trimmed.replace(/^>\s*/, "")}
          </p>
        </blockquote>,
      );
      continue;
    }
    elements.push(
      <p key={`p-${keyIdx++}`} className="text-secondary/70 text-[0.95rem] md:text-base leading-[1.9] mb-6">
        {trimmed}
      </p>,
    );
  }
  flushList();

  return <>{elements}</>;
}
