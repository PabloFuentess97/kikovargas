"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/admin/ui";
import { BLOCK_TYPES, BLOCK_LABELS, BLOCK_DEFAULTS } from "@/components/event-blocks/types";
import type { BlockType, BlockData } from "@/components/event-blocks/types";

/* ─── Types ──────────────────────────────────────── */

interface Block {
  id: string;
  type: string;
  data: BlockData;
  order: number;
}

interface Page {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  blocks: Block[];
}

/* ─── Block type icons (emoji) ───────────────────── */

const BLOCK_ICONS: Record<string, string> = {
  hero: "🎯",
  text: "📝",
  image: "🖼️",
  cta: "🔘",
  gallery: "🖼️",
  form: "📋",
  countdown: "⏰",
  faq: "❓",
  testimonials: "💬",
  video: "▶️",
  pricing: "💰",
  stats: "📊",
  divider: "➖",
  features: "✨",
};

const BLOCK_CATEGORIES = [
  {
    label: "Contenido",
    types: ["hero", "text", "image", "video", "gallery"] as BlockType[],
  },
  {
    label: "Conversion",
    types: ["cta", "form", "pricing", "countdown"] as BlockType[],
  },
  {
    label: "Social proof",
    types: ["testimonials", "stats", "faq", "features"] as BlockType[],
  },
  {
    label: "Layout",
    types: ["divider"] as BlockType[],
  },
];

/* ─── Main Editor ────────────────────────────────── */

export function EventEditor({ page }: { page: Page }) {
  const [blocks, setBlocks] = useState<Block[]>(page.blocks);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── Debounced auto-save ──
  const autoSave = useCallback((blockId: string, data: BlockData) => {
    // Clear previous timer
    if (saveTimers.current[blockId]) clearTimeout(saveTimers.current[blockId]);

    saveTimers.current[blockId] = setTimeout(async () => {
      setSavingIds((prev) => new Set(prev).add(blockId));

      await fetch(`/api/event-pages/${page.id}/blocks/${blockId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(blockId);
        return next;
      });

      // Flash saved indicator
      setSavedIds((prev) => new Set(prev).add(blockId));
      setTimeout(() => {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(blockId);
          return next;
        });
      }, 1500);
    }, 800);
  }, [page.id]);

  // ── Update block data locally + trigger auto-save ──
  function updateBlockData(blockId: string, data: BlockData) {
    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, data } : b));
    autoSave(blockId, data);
  }

  // ── Add block ──
  async function addBlock(type: BlockType) {
    setShowAddMenu(false);

    const res = await fetch(`/api/event-pages/${page.id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data: BLOCK_DEFAULTS[type] }),
    });

    const json = await res.json();
    if (res.ok) {
      setBlocks((prev) => [...prev, json.data]);
      setExpandedId(json.data.id);
    }
  }

  // ── Delete block ──
  async function deleteBlock(blockId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Eliminar este bloque?")) return;

    await fetch(`/api/event-pages/${page.id}/blocks/${blockId}`, { method: "DELETE" });
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (expandedId === blockId) setExpandedId(null);
  }

  // ── Duplicate block ──
  async function duplicateBlock(blockId: string, e: React.MouseEvent) {
    e.stopPropagation();
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    const res = await fetch(`/api/event-pages/${page.id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: block.type, data: block.data }),
    });

    const json = await res.json();
    if (res.ok) {
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.id === blockId);
        const next = [...prev];
        next.splice(idx + 1, 0, json.data);
        return next;
      });
      // Persist order
      const updated = [...blocks];
      const idx = updated.findIndex((b) => b.id === blockId);
      updated.splice(idx + 1, 0, json.data);
      await fetch(`/api/event-pages/${page.id}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockIds: updated.map((b) => b.id) }),
      });
    }
  }

  // ── Move block ──
  async function moveBlock(blockId: string, direction: "up" | "down", e: React.MouseEvent) {
    e.stopPropagation();
    const idx = blocks.findIndex((b) => b.id === blockId);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]];
    setBlocks(newBlocks);

    await fetch(`/api/event-pages/${page.id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockIds: newBlocks.map((b) => b.id) }),
    });
  }

  // ── Drag & drop ──
  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }

  async function handleDrop(idx: number) {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }

    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(dragIdx, 1);
    newBlocks.splice(idx, 0, moved);
    setBlocks(newBlocks);
    setDragIdx(null);
    setDragOverIdx(null);

    await fetch(`/api/event-pages/${page.id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockIds: newBlocks.map((b) => b.id) }),
    });
  }

  function openPreview() {
    window.open(`/event/${page.slug}`, "_blank");
  }

  return (
    <div className="space-y-3">
      {/* Top toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {blocks.length} {blocks.length === 1 ? "bloque" : "bloques"}
          </span>
          {expandedId && (
            <button
              onClick={() => setExpandedId(null)}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Cerrar editor
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={openPreview}>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Vista previa
            </span>
          </Button>
        </div>
      </div>

      {/* Block list */}
      {blocks.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border py-16 text-center">
          <div className="text-3xl mb-3">📄</div>
          <p className="text-sm text-muted mb-1">Pagina vacia</p>
          <p className="text-xs text-muted mb-4">Agrega bloques para construir tu landing page</p>
          <Button size="sm" onClick={() => setShowAddMenu(true)}>+ Agregar primer bloque</Button>
        </div>
      )}

      <div className="space-y-2">
        {blocks.map((block, idx) => {
          const isExpanded = expandedId === block.id;
          const isSaving = savingIds.has(block.id);
          const isSaved = savedIds.has(block.id);
          const isDragOver = dragOverIdx === idx && dragIdx !== idx;

          return (
            <div
              key={block.id}
              draggable={!isExpanded}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
              onDrop={() => handleDrop(idx)}
              className={`
                group rounded-xl border transition-all duration-200
                ${isExpanded
                  ? "border-a-accent/30 bg-card shadow-lg shadow-a-accent/5"
                  : "border-border bg-card hover:border-border/80"
                }
                ${isDragOver ? "border-a-accent/50 scale-[1.01]" : ""}
                ${dragIdx === idx ? "opacity-40" : ""}
              `}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              {/* ─── Block header (always visible) ─── */}
              <div
                className={`flex items-center gap-3 px-4 cursor-pointer select-none ${isExpanded ? "py-3.5" : "py-3"}`}
                onClick={() => setExpandedId(isExpanded ? null : block.id)}
              >
                {/* Drag handle */}
                <div className="cursor-grab active:cursor-grabbing text-muted/40 group-hover:text-muted transition-colors shrink-0">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                  </svg>
                </div>

                {/* Block icon + type */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm shrink-0">{BLOCK_ICONS[block.type] || "📦"}</span>
                  <span className="text-xs font-medium text-foreground shrink-0">
                    {BLOCK_LABELS[block.type as BlockType] || block.type}
                  </span>

                  {/* Inline preview summary */}
                  {!isExpanded && (
                    <span className="text-xs text-muted truncate ml-1">
                      <InlinePreviewText block={block} />
                    </span>
                  )}
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isSaving && (
                    <span className="flex items-center gap-1 text-[0.6rem] text-muted animate-pulse">
                      <div className="h-1.5 w-1.5 rounded-full bg-a-accent/60" />
                      Guardando
                    </span>
                  )}
                  {isSaved && !isSaving && (
                    <span className="flex items-center gap-1 text-[0.6rem] text-green-400 transition-opacity">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Guardado
                    </span>
                  )}
                </div>

                {/* Actions toolbar */}
                <div className={`flex items-center gap-0.5 shrink-0 transition-opacity ${isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  <button
                    onClick={(e) => moveBlock(block.id, "up", e)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-card-hover disabled:opacity-20 disabled:pointer-events-none transition-all"
                    title="Mover arriba"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => moveBlock(block.id, "down", e)}
                    disabled={idx === blocks.length - 1}
                    className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-card-hover disabled:opacity-20 disabled:pointer-events-none transition-all"
                    title="Mover abajo"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => duplicateBlock(block.id, e)}
                    className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-card-hover transition-all"
                    title="Duplicar"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => deleteBlock(block.id, e)}
                    className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-danger/5 transition-all"
                    title="Eliminar"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>

                  {/* Expand chevron */}
                  <svg
                    className={`h-4 w-4 text-muted ml-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              {/* ─── Visual mini-preview (collapsed) ─── */}
              {!isExpanded && (
                <div className="px-4 pb-3">
                  <VisualBlockPreview block={block} />
                </div>
              )}

              {/* ─── Expanded editor ─── */}
              {isExpanded && (
                <div className="border-t border-border/50 animate-[slideDown_0.2s_ease-out]">
                  {/* Live mini-preview */}
                  <div className="px-4 pt-4 pb-2">
                    <div className="rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] overflow-hidden">
                      <div className="px-3 py-1.5 border-b border-[#1a1a1e] flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#333]" />
                          <div className="h-1.5 w-1.5 rounded-full bg-[#333]" />
                          <div className="h-1.5 w-1.5 rounded-full bg-[#333]" />
                        </div>
                        <span className="text-[0.55rem] text-[#444]">Vista previa</span>
                      </div>
                      <div className="p-3 max-h-[200px] overflow-hidden">
                        <VisualBlockPreview block={block} expanded />
                      </div>
                    </div>
                  </div>

                  {/* Editor fields */}
                  <div className="px-4 pb-4 pt-2">
                    <InlineBlockEditor
                      block={block}
                      onChange={(data) => updateBlockData(block.id, data)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Add block button + menu ─── */}
      <div className="relative pt-1">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className={`
            w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all duration-200
            ${showAddMenu
              ? "border-a-accent text-a-accent bg-a-accent/5"
              : "border-border text-muted hover:border-a-accent/40 hover:text-a-accent"
            }
          `}
        >
          + Agregar bloque
        </button>

        {showAddMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
            <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-xl border border-border bg-a-surface p-4 shadow-2xl animate-[slideDown_0.15s_ease-out]">
              {BLOCK_CATEGORIES.map((cat) => (
                <div key={cat.label} className="mb-3 last:mb-0">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted mb-1.5 px-1">{cat.label}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                    {cat.types.map((type) => (
                      <button
                        key={type}
                        onClick={() => addBlock(type)}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg text-left hover:bg-card-hover transition-colors group/item"
                      >
                        <span className="text-base">{BLOCK_ICONS[type]}</span>
                        <span className="text-xs font-medium text-muted group-hover/item:text-foreground transition-colors">{BLOCK_LABELS[type]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── slideDown animation (inline via Tailwind arbitrary) ── */
// The `animate-[slideDown_0.2s_ease-out]` relies on this being in globals.css
// We use a safe inline style fallback

/* ─── Inline Preview Text (header summary) ───────── */

function InlinePreviewText({ block }: { block: Block }) {
  const d = block.data as Record<string, unknown>;

  switch (block.type) {
    case "hero": return <>&mdash; {(d.title as string)?.slice(0, 50) || "Sin titulo"}</>;
    case "text": return <>&mdash; {(d.heading as string)?.slice(0, 50) || "Sin encabezado"}</>;
    case "image": return <>&mdash; {(d.url as string) ? "Imagen configurada" : "Sin URL"}</>;
    case "cta": return <>&mdash; {(d.heading as string)?.slice(0, 50) || "Sin titulo"}</>;
    case "gallery": return <>&mdash; {((d.images as unknown[]) || []).length} imagenes</>;
    case "form": return <>&mdash; {(d.heading as string)?.slice(0, 40) || "Formulario"}</>;
    case "countdown": return <>&mdash; {(d.heading as string)?.slice(0, 40) || "Cuenta regresiva"}</>;
    case "faq": return <>&mdash; {((d.items as unknown[]) || []).length} preguntas</>;
    case "testimonials": return <>&mdash; {((d.items as unknown[]) || []).length} testimonios</>;
    case "video": return <>&mdash; {(d.heading as string)?.slice(0, 40) || (d.url as string) ? "Video" : "Sin URL"}</>;
    case "pricing": return <>&mdash; {((d.plans as unknown[]) || []).length} planes</>;
    case "stats": return <>&mdash; {((d.items as unknown[]) || []).length} estadisticas</>;
    case "divider": return <>&mdash; {(d.label as string) || (d.style as string) || "Linea"}</>;
    case "features": return <>&mdash; {((d.items as unknown[]) || []).length} caracteristicas</>;
    default: return null;
  }
}

/* ─── Visual Block Preview (mini-render) ─────────── */

function VisualBlockPreview({ block, expanded }: { block: Block; expanded?: boolean }) {
  const d = block.data as Record<string, unknown>;
  const scale = expanded ? "" : "scale-[0.85] origin-top-left";

  switch (block.type) {
    case "hero": {
      const title = (d.title as string) || "";
      const subtitle = (d.subtitle as string) || "";
      const ctaText = (d.ctaText as string) || "";
      return (
        <div className={`rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] p-4 text-center ${expanded ? "" : "max-h-[60px] overflow-hidden"}`}>
          {title && <p className="text-xs font-bold text-white truncate">{title}</p>}
          {subtitle && <p className="text-[0.6rem] text-[#888] mt-0.5 truncate">{subtitle}</p>}
          {ctaText && (
            <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#c9a84c] text-black text-[0.55rem] font-medium rounded">{ctaText}</span>
          )}
        </div>
      );
    }

    case "text": {
      const heading = (d.heading as string) || "";
      const body = (d.body as string) || "";
      return (
        <div className={`rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] p-3 ${expanded ? "" : "max-h-[60px] overflow-hidden"}`}>
          {heading && <p className="text-xs font-bold text-white mb-0.5">{heading}</p>}
          {body && <p className="text-[0.6rem] text-[#888] line-clamp-2">{body.replace(/<[^>]*>/g, "")}</p>}
        </div>
      );
    }

    case "image": {
      const url = (d.url as string) || "";
      return (
        <div className={`rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] overflow-hidden ${expanded ? "h-[140px]" : "h-[50px]"}`}>
          {url ? (
            <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#333] text-[0.6rem]">Sin imagen</div>
          )}
        </div>
      );
    }

    case "cta": {
      const heading = (d.heading as string) || "";
      const desc = (d.description as string) || "";
      const btnText = (d.buttonText as string) || "";
      const variant = (d.variant as string) || "primary";
      return (
        <div className={`rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] p-3 text-center ${expanded ? "" : "max-h-[60px] overflow-hidden"}`}>
          {heading && <p className="text-xs font-bold text-white">{heading}</p>}
          {desc && <p className="text-[0.6rem] text-[#888] mt-0.5 truncate">{desc}</p>}
          {btnText && (
            <span className={`inline-block mt-1.5 px-2 py-0.5 text-[0.55rem] font-medium rounded ${
              variant === "outline" ? "border border-[#c9a84c] text-[#c9a84c]" : "bg-[#c9a84c] text-black"
            }`}>{btnText}</span>
          )}
        </div>
      );
    }

    case "gallery": {
      const images = (d.images as { url: string }[]) || [];
      return (
        <div className={`flex gap-1 ${expanded ? "" : "max-h-[50px] overflow-hidden"}`}>
          {images.length === 0 ? (
            <div className="rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] w-full h-[50px] flex items-center justify-center text-[#333] text-[0.6rem]">Sin imagenes</div>
          ) : images.slice(0, 4).map((img, i) => (
            <div key={i} className="flex-1 rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] overflow-hidden h-[50px]">
              {img.url ? <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full bg-[#111]" />}
            </div>
          ))}
          {images.length > 4 && <span className="text-[0.55rem] text-muted self-center">+{images.length - 4}</span>}
        </div>
      );
    }

    case "form": {
      const heading = (d.heading as string) || "";
      const fields = (d.fields as string[]) || [];
      const FIELD_NAMES: Record<string, string> = { name: "Nombre", email: "Email", phone: "Telefono", message: "Mensaje" };
      return (
        <div className={`rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] p-3 ${expanded ? "" : "max-h-[60px] overflow-hidden"}`}>
          {heading && <p className="text-xs font-bold text-white mb-1.5">{heading}</p>}
          <div className="space-y-1">
            {fields.map((f) => (
              <div key={f} className="h-4 rounded bg-[#161618] border border-[#1e1e22] px-2 flex items-center">
                <span className="text-[0.5rem] text-[#555]">{FIELD_NAMES[f] || f}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "countdown": {
      const heading = (d.heading as string) || "";
      return (
        <div className={`rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] p-3 text-center ${expanded ? "" : "max-h-[60px] overflow-hidden"}`}>
          {heading && <p className="text-xs font-bold text-white mb-1.5">{heading}</p>}
          <div className="flex justify-center gap-2">
            {["00", "00", "00", "00"].map((v, i) => (
              <div key={i} className="w-8 h-8 rounded bg-[#161618] border border-[#1e1e22] flex items-center justify-center text-[0.6rem] font-bold text-white tabular-nums">{v}</div>
            ))}
          </div>
        </div>
      );
    }

    case "faq": {
      const heading = (d.heading as string) || "";
      const items = (d.items as { question: string }[]) || [];
      return (
        <div className={`rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] p-3 ${expanded ? "" : "max-h-[60px] overflow-hidden"}`}>
          {heading && <p className="text-xs font-bold text-white mb-1.5">{heading}</p>}
          <div className="space-y-1">
            {items.slice(0, expanded ? 6 : 2).map((item, i) => (
              <div key={i} className="flex items-center gap-2 rounded bg-[#161618] border border-[#1e1e22] px-2.5 py-1.5">
                <span className="text-[0.6rem] text-[#888] truncate">{item.question}</span>
                <svg className="h-2.5 w-2.5 text-[#c9a84c] shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            ))}
            {items.length > (expanded ? 6 : 2) && <span className="text-[0.5rem] text-muted">+{items.length - (expanded ? 6 : 2)} mas</span>}
          </div>
        </div>
      );
    }

    case "testimonials": {
      const items = (d.items as { name: string; text: string }[]) || [];
      return (
        <div className={`flex gap-1.5 ${expanded ? "" : "max-h-[60px] overflow-hidden"}`}>
          {items.length === 0 ? (
            <div className="rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] w-full p-3 text-center text-[#333] text-[0.6rem]">Sin testimonios</div>
          ) : items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex-1 rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] p-2">
              <p className="text-[0.5rem] text-[#888] line-clamp-2">&ldquo;{item.text}&rdquo;</p>
              <p className="text-[0.5rem] text-[#c9a84c] mt-1 font-medium">{item.name}</p>
            </div>
          ))}
        </div>
      );
    }

    case "video": {
      const heading = (d.heading as string) || "";
      return (
        <div className={`rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] overflow-hidden ${expanded ? "h-[140px]" : "h-[50px]"} flex items-center justify-center relative`}>
          <div className="text-center">
            <svg className="h-6 w-6 text-[#444] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
            {heading && <p className="text-[0.55rem] text-[#555] mt-1">{heading}</p>}
          </div>
        </div>
      );
    }

    case "pricing": {
      const plans = (d.plans as { name: string; price: string; highlighted?: boolean }[]) || [];
      return (
        <div className={`flex gap-1.5 ${expanded ? "" : "max-h-[60px] overflow-hidden"}`}>
          {plans.length === 0 ? (
            <div className="rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] w-full p-3 text-center text-[#333] text-[0.6rem]">Sin planes</div>
          ) : plans.map((plan, i) => (
            <div key={i} className={`flex-1 rounded-lg border p-2 text-center ${plan.highlighted ? "border-[#c9a84c]/40 bg-[#c9a84c]/5" : "border-[#1a1a1e] bg-[#0a0a0c]"}`}>
              <p className="text-[0.55rem] font-medium text-white">{plan.name}</p>
              <p className="text-xs font-bold text-[#c9a84c]">{plan.price}</p>
            </div>
          ))}
        </div>
      );
    }

    case "stats": {
      const items = (d.items as { value: string; label: string }[]) || [];
      return (
        <div className={`flex gap-1.5 ${expanded ? "" : "max-h-[50px] overflow-hidden"}`}>
          {items.map((item, i) => (
            <div key={i} className="flex-1 rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] p-2 text-center">
              <p className="text-xs font-bold text-[#c9a84c] tabular-nums">{item.value}</p>
              <p className="text-[0.5rem] text-[#666] uppercase">{item.label}</p>
            </div>
          ))}
        </div>
      );
    }

    case "divider": {
      const label = (d.label as string) || "";
      const style = (d.style as string) || "line";
      return (
        <div className="py-1 flex items-center gap-3">
          {style === "dots" ? (
            <div className="flex-1 flex justify-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#c9a84c]/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]/50" />
              <span className="h-1 w-1 rounded-full bg-[#c9a84c]/30" />
            </div>
          ) : style === "space" ? (
            <div className="flex-1 text-center text-[0.55rem] text-[#333]">Espacio</div>
          ) : (
            <>
              <div className="flex-1 h-px bg-[#1a1a1e]" />
              {label && <span className="text-[0.55rem] text-[#444]">{label}</span>}
              {label && <div className="flex-1 h-px bg-[#1a1a1e]" />}
            </>
          )}
        </div>
      );
    }

    case "features": {
      const items = (d.items as { icon?: string; title: string }[]) || [];
      return (
        <div className={`grid grid-cols-3 gap-1 ${expanded ? "" : "max-h-[60px] overflow-hidden"}`}>
          {items.slice(0, expanded ? 6 : 3).map((item, i) => (
            <div key={i} className="rounded-lg bg-[#0a0a0c] border border-[#1a1a1e] p-1.5">
              <span className="text-xs">{item.icon || "✓"}</span>
              <p className="text-[0.5rem] text-[#888] truncate">{item.title}</p>
            </div>
          ))}
          {items.length > (expanded ? 6 : 3) && <span className="text-[0.5rem] text-muted col-span-3">+{items.length - (expanded ? 6 : 3)} mas</span>}
        </div>
      );
    }

    default:
      return <div className="text-[0.6rem] text-muted">Bloque desconocido</div>;
  }
}

/* ─── Inline Block Editor ────────────────────────── */

function InlineBlockEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: BlockData) => void;
}) {
  const data = block.data;

  function set(key: string, value: unknown) {
    onChange({ ...data, [key]: value });
  }

  function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
      <div>
        <label className="flex items-baseline gap-2 mb-1.5">
          <span className="text-xs font-medium text-foreground/70">{label}</span>
          {hint && <span className="text-[0.6rem] text-muted">{hint}</span>}
        </label>
        {children}
      </div>
    );
  }

  const inputCls = "w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-a-accent focus:outline-none focus:ring-1 focus:ring-a-accent/20 transition-colors";
  const textareaCls = `${inputCls} resize-none`;

  function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="rounded-lg border border-border/50 p-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted mb-3">{label}</p>
        <div className="space-y-3">{children}</div>
      </div>
    );
  }

  switch (block.type) {
    case "hero":
      return (
        <div className="space-y-3">
          <Field label="Titulo">
            <input className={inputCls} value={(data.title as string) || ""} onChange={(e) => set("title", e.target.value)} placeholder="Titulo principal del hero" />
          </Field>
          <Field label="Subtitulo">
            <textarea className={textareaCls} rows={2} value={(data.subtitle as string) || ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="Descripcion bajo el titulo" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Texto del boton">
              <input className={inputCls} value={(data.ctaText as string) || ""} onChange={(e) => set("ctaText", e.target.value)} placeholder="Ej: Registrate ahora" />
            </Field>
            <Field label="Enlace del boton">
              <input className={inputCls} value={(data.ctaHref as string) || ""} onChange={(e) => set("ctaHref", e.target.value)} placeholder="#form" />
            </Field>
          </div>
          <Field label="Imagen de fondo" hint="URL">
            <input className={inputCls} type="url" value={(data.backgroundUrl as string) || ""} onChange={(e) => set("backgroundUrl", e.target.value)} placeholder="https://..." />
          </Field>
        </div>
      );

    case "text":
      return (
        <div className="space-y-3">
          <Field label="Encabezado">
            <input className={inputCls} value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} placeholder="Titulo de la seccion" />
          </Field>
          <Field label="Contenido" hint="Soporta HTML">
            <textarea className={textareaCls} rows={5} value={(data.body as string) || ""} onChange={(e) => set("body", e.target.value)} placeholder="Escribe el contenido aqui..." />
          </Field>
          <Field label="Alineacion">
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => set("align", align)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    (data.align || "center") === align
                      ? "bg-a-accent/10 text-a-accent border border-a-accent/30"
                      : "text-muted border border-border hover:text-foreground"
                  }`}
                >
                  {align === "left" ? "Izq" : align === "center" ? "Centro" : "Der"}
                </button>
              ))}
            </div>
          </Field>
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <Field label="URL de la imagen">
            <input className={inputCls} type="url" value={(data.url as string) || ""} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Texto alternativo">
              <input className={inputCls} value={(data.alt as string) || ""} onChange={(e) => set("alt", e.target.value)} placeholder="Descripcion de la imagen" />
            </Field>
            <Field label="Pie de foto">
              <input className={inputCls} value={(data.caption as string) || ""} onChange={(e) => set("caption", e.target.value)} placeholder="Opcional" />
            </Field>
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="space-y-3">
          <Field label="Titulo">
            <input className={inputCls} value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} placeholder="Titulo del CTA" />
          </Field>
          <Field label="Descripcion">
            <textarea className={textareaCls} rows={2} value={(data.description as string) || ""} onChange={(e) => set("description", e.target.value)} placeholder="Texto de soporte" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Texto del boton">
              <input className={inputCls} value={(data.buttonText as string) || ""} onChange={(e) => set("buttonText", e.target.value)} placeholder="Ej: Reservar" />
            </Field>
            <Field label="Enlace">
              <input className={inputCls} value={(data.buttonHref as string) || ""} onChange={(e) => set("buttonHref", e.target.value)} placeholder="#form" />
            </Field>
          </div>
          <Field label="Estilo">
            <div className="flex gap-1">
              {(["primary", "outline"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => set("variant", v)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    (data.variant || "primary") === v
                      ? "bg-a-accent/10 text-a-accent border border-a-accent/30"
                      : "text-muted border border-border hover:text-foreground"
                  }`}
                >
                  {v === "primary" ? "Relleno" : "Contorno"}
                </button>
              ))}
            </div>
          </Field>
        </div>
      );

    case "video":
      return (
        <div className="space-y-3">
          <Field label="Titulo">
            <input className={inputCls} value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} placeholder="Titulo de la seccion" />
          </Field>
          <Field label="Descripcion">
            <textarea className={textareaCls} rows={2} value={(data.description as string) || ""} onChange={(e) => set("description", e.target.value)} placeholder="Descripcion opcional" />
          </Field>
          <Field label="URL del video" hint="YouTube o Vimeo">
            <input className={inputCls} type="url" value={(data.url as string) || ""} onChange={(e) => set("url", e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          </Field>
        </div>
      );

    case "countdown":
      return (
        <div className="space-y-3">
          <Field label="Titulo">
            <input className={inputCls} value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} placeholder="El evento comienza en" />
          </Field>
          <Field label="Descripcion">
            <input className={inputCls} value={(data.description as string) || ""} onChange={(e) => set("description", e.target.value)} placeholder="Subtitulo opcional" />
          </Field>
          <Field label="Fecha y hora objetivo">
            <input className={inputCls} type="datetime-local" value={(data.targetDate as string)?.slice(0, 16) || ""} onChange={(e) => set("targetDate", new Date(e.target.value).toISOString())} />
          </Field>
        </div>
      );

    case "divider":
      return (
        <div className="space-y-3">
          <Field label="Estilo">
            <div className="flex gap-1">
              {(["line", "dots", "space"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => set("style", s)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    (data.style || "line") === s
                      ? "bg-a-accent/10 text-a-accent border border-a-accent/30"
                      : "text-muted border border-border hover:text-foreground"
                  }`}
                >
                  {s === "line" ? "Linea" : s === "dots" ? "Puntos" : "Espacio"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Etiqueta" hint="Opcional, solo para linea">
            <input className={inputCls} value={(data.label as string) || ""} onChange={(e) => set("label", e.target.value)} placeholder="Ej: TESTIMONIOS" />
          </Field>
        </div>
      );

    case "gallery":
      return <GalleryEditor data={data} onChange={onChange} inputCls={inputCls} />;

    case "form":
      return (
        <div className="space-y-3">
          <Field label="Titulo">
            <input className={inputCls} value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} placeholder="Titulo del formulario" />
          </Field>
          <Field label="Descripcion">
            <textarea className={textareaCls} rows={2} value={(data.description as string) || ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Texto del boton">
            <input className={inputCls} value={(data.buttonText as string) || ""} onChange={(e) => set("buttonText", e.target.value)} placeholder="Enviar" />
          </Field>
          <FormFieldsEditor data={data} onChange={onChange} />
        </div>
      );

    case "faq":
      return (
        <div className="space-y-3">
          <Field label="Titulo">
            <input className={inputCls} value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} placeholder="Preguntas frecuentes" />
          </Field>
          <FaqEditor data={data} onChange={onChange} inputCls={inputCls} />
        </div>
      );

    case "testimonials":
      return (
        <div className="space-y-3">
          <Field label="Titulo">
            <input className={inputCls} value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} placeholder="Lo que dicen nuestros alumnos" />
          </Field>
          <TestimonialsEditor data={data} onChange={onChange} inputCls={inputCls} />
        </div>
      );

    case "pricing":
      return (
        <div className="space-y-3">
          <Field label="Titulo">
            <input className={inputCls} value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} placeholder="Elige tu plan" />
          </Field>
          <Field label="Descripcion">
            <textarea className={textareaCls} rows={2} value={(data.description as string) || ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <PricingEditor data={data} onChange={onChange} inputCls={inputCls} />
        </div>
      );

    case "stats":
      return (
        <div className="space-y-3">
          <Field label="Titulo" hint="Opcional">
            <input className={inputCls} value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} placeholder="Titulo de la seccion" />
          </Field>
          <StatsEditor data={data} onChange={onChange} inputCls={inputCls} />
        </div>
      );

    case "features":
      return (
        <div className="space-y-3">
          <Field label="Titulo">
            <input className={inputCls} value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} placeholder="Que incluye" />
          </Field>
          <Field label="Descripcion">
            <textarea className={textareaCls} rows={2} value={(data.description as string) || ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Columnas">
            <div className="flex gap-1">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => set("columns", n)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    (Number(data.columns) || 3) === n
                      ? "bg-a-accent/10 text-a-accent border border-a-accent/30"
                      : "text-muted border border-border hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>
          <FeaturesEditor data={data} onChange={onChange} inputCls={inputCls} />
        </div>
      );

    default:
      return <p className="text-xs text-muted">Editor no disponible</p>;
  }
}

/* ─── Sub-editors (all with auto-save via onChange) ── */

interface SubEditorProps {
  data: BlockData;
  onChange: (d: BlockData) => void;
  inputCls: string;
}

function GalleryEditor({ data, onChange, inputCls }: SubEditorProps) {
  const images = ((data.images as { url: string; alt?: string }[]) || []);

  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted mb-2">Imagenes</p>
      <div className="space-y-2">
        {images.map((img, i) => (
          <div key={i} className="flex gap-2 items-center">
            <div className="h-8 w-8 rounded bg-[#111] border border-border overflow-hidden shrink-0">
              {img.url ? <img src={img.url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[0.5rem] text-muted">{i + 1}</div>}
            </div>
            <input
              type="url"
              value={img.url}
              onChange={(e) => {
                const updated = [...images];
                updated[i] = { ...updated[i], url: e.target.value };
                onChange({ ...data, images: updated });
              }}
              placeholder="URL de la imagen"
              className={`flex-1 ${inputCls}`}
            />
            <button
              onClick={() => onChange({ ...data, images: images.filter((_, idx) => idx !== i) })}
              className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-danger/5 transition-all shrink-0"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange({ ...data, images: [...images, { url: "", alt: "" }] })}
        className="mt-2 text-xs text-a-accent hover:underline"
      >
        + Agregar imagen
      </button>
    </div>
  );
}

function FormFieldsEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const fields = (data.fields as string[]) || ["name", "email"];
  const allFields = [
    { key: "name", label: "Nombre", icon: "👤" },
    { key: "email", label: "Email", icon: "📧" },
    { key: "phone", label: "Telefono", icon: "📞" },
    { key: "message", label: "Mensaje", icon: "💬" },
  ];

  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted mb-2">Campos del formulario</p>
      <div className="flex flex-wrap gap-1.5">
        {allFields.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              const updated = fields.includes(f.key)
                ? fields.filter((x) => x !== f.key)
                : [...fields, f.key];
              onChange({ ...data, fields: updated });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              fields.includes(f.key)
                ? "border-a-accent/40 bg-a-accent/10 text-a-accent"
                : "border-border text-muted hover:text-foreground hover:border-border/80"
            }`}
          >
            <span className="text-xs">{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FaqEditor({ data, onChange, inputCls }: SubEditorProps) {
  const items = (data.items as { question: string; answer: string }[]) || [];

  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted mb-2">Preguntas</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-border/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.6rem] text-muted font-medium">Pregunta {i + 1}</span>
              <button
                onClick={() => onChange({ ...data, items: items.filter((_, idx) => idx !== i) })}
                className="p-1 rounded text-muted hover:text-danger transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={item.question}
              onChange={(e) => {
                const updated = [...items];
                updated[i] = { ...updated[i], question: e.target.value };
                onChange({ ...data, items: updated });
              }}
              placeholder="Pregunta"
              className={inputCls}
            />
            <textarea
              value={item.answer}
              onChange={(e) => {
                const updated = [...items];
                updated[i] = { ...updated[i], answer: e.target.value };
                onChange({ ...data, items: updated });
              }}
              placeholder="Respuesta"
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange({ ...data, items: [...items, { question: "", answer: "" }] })}
        className="mt-2 text-xs text-a-accent hover:underline"
      >
        + Agregar pregunta
      </button>
    </div>
  );
}

function TestimonialsEditor({ data, onChange, inputCls }: SubEditorProps) {
  const items = (data.items as { name: string; role?: string; text: string; avatar?: string }[]) || [];

  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted mb-2">Testimonios</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-border/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.6rem] text-muted font-medium">Testimonio {i + 1}</span>
              <button
                onClick={() => onChange({ ...data, items: items.filter((_, idx) => idx !== i) })}
                className="p-1 rounded text-muted hover:text-danger transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={item.name} onChange={(e) => { const u = [...items]; u[i] = { ...u[i], name: e.target.value }; onChange({ ...data, items: u }); }} placeholder="Nombre" className={inputCls} />
              <input value={item.role || ""} onChange={(e) => { const u = [...items]; u[i] = { ...u[i], role: e.target.value }; onChange({ ...data, items: u }); }} placeholder="Rol" className={inputCls} />
            </div>
            <textarea value={item.text} onChange={(e) => { const u = [...items]; u[i] = { ...u[i], text: e.target.value }; onChange({ ...data, items: u }); }} placeholder="Testimonio" rows={2} className={`${inputCls} resize-none`} />
            <input type="url" value={item.avatar || ""} onChange={(e) => { const u = [...items]; u[i] = { ...u[i], avatar: e.target.value }; onChange({ ...data, items: u }); }} placeholder="URL avatar (opcional)" className={inputCls} />
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange({ ...data, items: [...items, { name: "", role: "", text: "", avatar: "" }] })}
        className="mt-2 text-xs text-a-accent hover:underline"
      >
        + Agregar testimonio
      </button>
    </div>
  );
}

function PricingEditor({ data, onChange, inputCls }: SubEditorProps) {
  const plans = (data.plans as { name: string; price: string; period?: string; features: string[]; buttonText: string; buttonHref: string; highlighted?: boolean }[]) || [];

  function updatePlan(idx: number, field: string, value: unknown) {
    const updated = [...plans];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ ...data, plans: updated });
  }

  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted mb-2">Planes</p>
      <div className="space-y-3">
        {plans.map((plan, i) => (
          <div key={i} className={`rounded-lg border p-3 space-y-2 ${plan.highlighted ? "border-a-accent/30 bg-a-accent/5" : "border-border/50"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] text-muted font-medium">Plan {i + 1}</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plan.highlighted || false}
                    onChange={(e) => updatePlan(i, "highlighted", e.target.checked)}
                    className="rounded border-border h-3 w-3"
                  />
                  <span className="text-[0.55rem] text-muted">Destacar</span>
                </label>
              </div>
              <button
                onClick={() => onChange({ ...data, plans: plans.filter((_, idx) => idx !== i) })}
                className="p-1 rounded text-muted hover:text-danger transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input value={plan.name} onChange={(e) => updatePlan(i, "name", e.target.value)} placeholder="Nombre" className={inputCls} />
              <input value={plan.price} onChange={(e) => updatePlan(i, "price", e.target.value)} placeholder="Precio" className={inputCls} />
              <input value={plan.period || ""} onChange={(e) => updatePlan(i, "period", e.target.value)} placeholder="/mes" className={inputCls} />
            </div>
            <input value={plan.buttonText} onChange={(e) => updatePlan(i, "buttonText", e.target.value)} placeholder="Texto del boton" className={inputCls} />

            <div>
              <span className="text-[0.55rem] text-muted">Caracteristicas:</span>
              {plan.features.map((feat, fi) => (
                <div key={fi} className="flex gap-1.5 mt-1">
                  <input
                    value={feat}
                    onChange={(e) => {
                      const feats = [...plan.features]; feats[fi] = e.target.value;
                      updatePlan(i, "features", feats);
                    }}
                    placeholder="Caracteristica"
                    className={`flex-1 ${inputCls}`}
                  />
                  <button
                    onClick={() => updatePlan(i, "features", plan.features.filter((_, idx) => idx !== fi))}
                    className="p-1 text-muted hover:text-danger shrink-0"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => updatePlan(i, "features", [...plan.features, ""])}
                className="mt-1 text-[0.55rem] text-a-accent hover:underline"
              >
                + Caracteristica
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange({ ...data, plans: [...plans, { name: "", price: "0€", period: "/mes", features: [""], buttonText: "Elegir", buttonHref: "#form", highlighted: false }] })}
        className="mt-2 text-xs text-a-accent hover:underline"
      >
        + Agregar plan
      </button>
    </div>
  );
}

function StatsEditor({ data, onChange, inputCls }: SubEditorProps) {
  const items = (data.items as { value: string; label: string }[]) || [];

  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted mb-2">Estadisticas</p>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={item.value}
              onChange={(e) => { const u = [...items]; u[i] = { ...u[i], value: e.target.value }; onChange({ ...data, items: u }); }}
              placeholder="500+"
              className={`w-24 text-center ${inputCls}`}
            />
            <input
              value={item.label}
              onChange={(e) => { const u = [...items]; u[i] = { ...u[i], label: e.target.value }; onChange({ ...data, items: u }); }}
              placeholder="Etiqueta"
              className={`flex-1 ${inputCls}`}
            />
            <button
              onClick={() => onChange({ ...data, items: items.filter((_, idx) => idx !== i) })}
              className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-danger/5 transition-all shrink-0"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange({ ...data, items: [...items, { value: "0", label: "" }] })}
        className="mt-2 text-xs text-a-accent hover:underline"
      >
        + Agregar estadistica
      </button>
    </div>
  );
}

function FeaturesEditor({ data, onChange, inputCls }: SubEditorProps) {
  const items = (data.items as { icon?: string; title: string; description: string }[]) || [];

  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted mb-2">Caracteristicas</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-border/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.6rem] text-muted font-medium">#{i + 1}</span>
              <button
                onClick={() => onChange({ ...data, items: items.filter((_, idx) => idx !== i) })}
                className="p-1 rounded text-muted hover:text-danger transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <input
                value={item.icon || ""}
                onChange={(e) => { const u = [...items]; u[i] = { ...u[i], icon: e.target.value }; onChange({ ...data, items: u }); }}
                placeholder="Emoji"
                className={`w-14 text-center ${inputCls}`}
              />
              <input
                value={item.title}
                onChange={(e) => { const u = [...items]; u[i] = { ...u[i], title: e.target.value }; onChange({ ...data, items: u }); }}
                placeholder="Titulo"
                className={`flex-1 ${inputCls}`}
              />
            </div>
            <textarea
              value={item.description}
              onChange={(e) => { const u = [...items]; u[i] = { ...u[i], description: e.target.value }; onChange({ ...data, items: u }); }}
              placeholder="Descripcion"
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange({ ...data, items: [...items, { icon: "✓", title: "", description: "" }] })}
        className="mt-2 text-xs text-a-accent hover:underline"
      >
        + Agregar caracteristica
      </button>
    </div>
  );
}
