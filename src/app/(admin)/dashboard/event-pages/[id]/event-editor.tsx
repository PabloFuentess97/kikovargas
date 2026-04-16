"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button } from "@/components/admin/ui";
import { BLOCK_TYPES, BLOCK_LABELS, BLOCK_DEFAULTS } from "@/components/event-blocks/types";
import type { BlockType, BlockData } from "@/components/event-blocks/types";

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

export function EventEditor({ page }: { page: Page }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>(page.blocks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

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
      setEditingId(json.data.id);
    }
  }

  // ── Save block data ──
  async function saveBlock(blockId: string, data: BlockData) {
    setSaving(blockId);

    await fetch(`/api/event-pages/${page.id}/blocks/${blockId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, data } : b));
    setSaving(null);
    setEditingId(null);
  }

  // ── Delete block ──
  async function deleteBlock(blockId: string) {
    if (!confirm("Eliminar este bloque?")) return;

    await fetch(`/api/event-pages/${page.id}/blocks/${blockId}`, { method: "DELETE" });
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (editingId === blockId) setEditingId(null);
  }

  // ── Move block up/down ──
  async function moveBlock(blockId: string, direction: "up" | "down") {
    const idx = blocks.findIndex((b) => b.id === blockId);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]];
    setBlocks(newBlocks);

    // Persist order
    await fetch(`/api/event-pages/${page.id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockIds: newBlocks.map((b) => b.id) }),
    });
  }

  // ── Preview link ──
  function openPreview() {
    window.open(`/event/${page.slug}`, "_blank");
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={openPreview}>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Vista previa
          </span>
        </Button>
        <span className="text-xs text-muted">{blocks.length} bloques</span>
      </div>

      {/* Block list */}
      {blocks.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <svg className="h-8 w-8 text-[#333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
              </svg>
              <p className="text-sm text-muted mb-1">Sin bloques</p>
              <p className="text-xs text-muted">Agrega bloques para construir tu landing page.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {blocks.map((block, idx) => (
        <Card key={block.id}>
          <CardContent>
            {/* Block header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-bold text-muted uppercase tracking-wider bg-card-hover px-2 py-0.5 rounded">
                  {BLOCK_LABELS[block.type as BlockType] || block.type}
                </span>
                <span className="text-[0.6rem] text-muted">#{idx + 1}</span>
              </div>

              <div className="flex items-center gap-1">
                {/* Move up */}
                <button
                  onClick={() => moveBlock(block.id, "up")}
                  disabled={idx === 0}
                  className="p-1.5 rounded text-muted hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Mover arriba"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>

                {/* Move down */}
                <button
                  onClick={() => moveBlock(block.id, "down")}
                  disabled={idx === blocks.length - 1}
                  className="p-1.5 rounded text-muted hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Mover abajo"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Edit toggle */}
                <button
                  onClick={() => setEditingId(editingId === block.id ? null : block.id)}
                  className={`p-1.5 rounded transition-colors ${editingId === block.id ? "text-a-accent" : "text-muted hover:text-foreground"}`}
                  title="Editar"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="p-1.5 rounded text-muted hover:text-danger transition-colors"
                  title="Eliminar"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Block editor (inline JSON fields) */}
            {editingId === block.id && (
              <BlockEditor
                block={block}
                onSave={(data) => saveBlock(block.id, data)}
                onCancel={() => setEditingId(null)}
                saving={saving === block.id}
              />
            )}

            {/* Block preview (collapsed) */}
            {editingId !== block.id && (
              <BlockPreview block={block} />
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add block button */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted hover:border-a-accent hover:text-a-accent transition-colors"
        >
          + Agregar bloque
        </button>

        {showAddMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
            <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-xl border border-border bg-a-surface p-2 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {BLOCK_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="p-3 rounded-lg text-left hover:bg-card-hover transition-colors"
                >
                  <p className="text-xs font-medium text-foreground">{BLOCK_LABELS[type]}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Block Preview (collapsed state) ────────────── */

function BlockPreview({ block }: { block: Block }) {
  const data = block.data as Record<string, unknown>;

  const preview = (() => {
    switch (block.type) {
      case "hero": return (data.title as string) || "Hero sin titulo";
      case "text": return (data.heading as string) || "Seccion de texto";
      case "image": return (data.url as string) ? "Imagen configurada" : "Imagen sin URL";
      case "cta": return (data.heading as string) || "Call to Action";
      case "gallery": {
        const imgs = (data.images as unknown[]) || [];
        return `${imgs.length} imagenes`;
      }
      case "form": return (data.heading as string) || "Formulario";
      case "countdown": return (data.heading as string) || "Cuenta regresiva";
      case "faq": {
        const items = (data.items as unknown[]) || [];
        return `${items.length} preguntas`;
      }
      case "testimonials": {
        const tItems = (data.items as unknown[]) || [];
        return `${tItems.length} testimonios`;
      }
      case "video": return (data.heading as string) || (data.url as string) || "Video";
      case "pricing": {
        const plans = (data.plans as unknown[]) || [];
        return `${plans.length} planes`;
      }
      case "stats": {
        const sItems = (data.items as unknown[]) || [];
        return `${sItems.length} estadisticas`;
      }
      case "divider": return (data.label as string) || `Separador (${(data.style as string) || "line"})`;
      case "features": {
        const fItems = (data.items as unknown[]) || [];
        return `${fItems.length} caracteristicas`;
      }
      default: return "Bloque";
    }
  })();

  return (
    <p className="text-xs text-muted truncate">{preview}</p>
  );
}

/* ─── Block Editor (dynamic fields based on type) ── */

function BlockEditor({
  block,
  onSave,
  onCancel,
  saving,
}: {
  block: Block;
  onSave: (data: BlockData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [data, setData] = useState<BlockData>({ ...block.data });

  function set(key: string, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function inputField(label: string, key: string, type: "text" | "url" | "datetime-local" = "text") {
    return (
      <div key={key}>
        <label className="block text-xs font-medium text-muted mb-1">{label}</label>
        <input
          type={type}
          value={(data[key] as string) || ""}
          onChange={(e) => set(key, e.target.value)}
          className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
        />
      </div>
    );
  }

  function textareaField(label: string, key: string, rows = 4) {
    return (
      <div key={key}>
        <label className="block text-xs font-medium text-muted mb-1">{label}</label>
        <textarea
          value={(data[key] as string) || ""}
          onChange={(e) => set(key, e.target.value)}
          rows={rows}
          className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none resize-none"
        />
      </div>
    );
  }

  function selectField(label: string, key: string, options: { value: string; label: string }[]) {
    return (
      <div key={key}>
        <label className="block text-xs font-medium text-muted mb-1">{label}</label>
        <select
          value={(data[key] as string) || options[0]?.value}
          onChange={(e) => set(key, e.target.value)}
          className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }

  // Render fields based on block type
  const fields = (() => {
    switch (block.type) {
      case "hero":
        return [
          inputField("Titulo", "title"),
          textareaField("Subtitulo", "subtitle", 2),
          inputField("Imagen de fondo (URL)", "backgroundUrl", "url"),
          inputField("Texto del boton", "ctaText"),
          inputField("Enlace del boton", "ctaHref"),
        ];
      case "text":
        return [
          inputField("Encabezado", "heading"),
          textareaField("Contenido", "body", 6),
          selectField("Alineacion", "align", [
            { value: "left", label: "Izquierda" },
            { value: "center", label: "Centro" },
            { value: "right", label: "Derecha" },
          ]),
        ];
      case "image":
        return [
          inputField("URL de imagen", "url", "url"),
          inputField("Texto alternativo", "alt"),
          inputField("Pie de foto", "caption"),
        ];
      case "cta":
        return [
          inputField("Titulo", "heading"),
          textareaField("Descripcion", "description", 2),
          inputField("Texto del boton", "buttonText"),
          inputField("Enlace del boton", "buttonHref"),
          selectField("Estilo", "variant", [
            { value: "primary", label: "Primario (relleno)" },
            { value: "outline", label: "Contorno" },
          ]),
        ];
      case "gallery":
        return [<GalleryEditor key="gal" data={data} onChange={setData} />];
      case "form":
        return [
          inputField("Titulo", "heading"),
          textareaField("Descripcion", "description", 2),
          inputField("Texto del boton", "buttonText"),
          <FormFieldsEditor key="fields" data={data} onChange={setData} />,
        ];
      case "countdown":
        return [
          inputField("Titulo", "heading"),
          inputField("Descripcion", "description"),
          inputField("Fecha objetivo", "targetDate", "datetime-local"),
        ];
      case "faq":
        return [
          inputField("Titulo", "heading"),
          <FaqEditor key="faq" data={data} onChange={setData} />,
        ];
      case "testimonials":
        return [
          inputField("Titulo", "heading"),
          <TestimonialsEditor key="testimonials" data={data} onChange={setData} />,
        ];
      case "video":
        return [
          inputField("Titulo", "heading"),
          textareaField("Descripcion", "description", 2),
          inputField("URL del video (YouTube, Vimeo)", "url", "url"),
        ];
      case "pricing":
        return [
          inputField("Titulo", "heading"),
          textareaField("Descripcion", "description", 2),
          <PricingEditor key="pricing" data={data} onChange={setData} />,
        ];
      case "stats":
        return [
          inputField("Titulo (opcional)", "heading"),
          <StatsEditor key="stats" data={data} onChange={setData} />,
        ];
      case "divider":
        return [
          inputField("Etiqueta (opcional)", "label"),
          selectField("Estilo", "style", [
            { value: "line", label: "Linea" },
            { value: "dots", label: "Puntos" },
            { value: "space", label: "Espacio" },
          ]),
        ];
      case "features":
        return [
          inputField("Titulo", "heading"),
          textareaField("Descripcion", "description", 2),
          selectField("Columnas", "columns", [
            { value: "2", label: "2 columnas" },
            { value: "3", label: "3 columnas" },
            { value: "4", label: "4 columnas" },
          ]),
          <FeaturesEditor key="features" data={data} onChange={setData} />,
        ];
      default:
        return [<p key="unknown" className="text-xs text-muted">Editor no disponible para este tipo de bloque</p>];
    }
  })();

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      {fields}
      <div className="flex gap-2 pt-2">
        <Button onClick={() => onSave(data)} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-muted hover:text-foreground">
          Cancelar
        </button>
      </div>
    </div>
  );
}

/* ─── Gallery sub-editor ─────────────────────────── */

function GalleryEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const images = ((data.images as { url: string; alt?: string }[]) || []);

  function addImage() {
    onChange({ ...data, images: [...images, { url: "", alt: "" }] });
  }

  function updateImage(idx: number, field: string, value: string) {
    const updated = [...images];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ ...data, images: updated });
  }

  function removeImage(idx: number) {
    onChange({ ...data, images: images.filter((_, i) => i !== idx) });
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-2">Imagenes</label>
      <div className="space-y-2">
        {images.map((img, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="url"
              value={img.url}
              onChange={(e) => updateImage(i, "url", e.target.value)}
              placeholder="URL de la imagen"
              className="flex-1 rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
            />
            <button onClick={() => removeImage(i)} className="text-xs text-muted hover:text-danger">✕</button>
          </div>
        ))}
      </div>
      <button onClick={addImage} className="mt-2 text-xs text-a-accent hover:underline">+ Agregar imagen</button>
    </div>
  );
}

/* ─── Form fields sub-editor ─────────────────────── */

function FormFieldsEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const fields = (data.fields as string[]) || ["name", "email"];
  const allFields = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Telefono" },
    { key: "message", label: "Mensaje" },
  ];

  function toggle(key: string) {
    const updated = fields.includes(key)
      ? fields.filter((f) => f !== key)
      : [...fields, key];
    onChange({ ...data, fields: updated });
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-2">Campos del formulario</label>
      <div className="flex flex-wrap gap-2">
        {allFields.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => toggle(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              fields.includes(f.key)
                ? "border-a-accent bg-a-accent/10 text-a-accent"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Testimonials sub-editor ───────────────────── */

function TestimonialsEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const items = (data.items as { name: string; role?: string; text: string; avatar?: string }[]) || [];

  function addItem() {
    onChange({ ...data, items: [...items, { name: "", role: "", text: "", avatar: "" }] });
  }

  function updateItem(idx: number, field: string, value: string) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ ...data, items: updated });
  }

  function removeItem(idx: number) {
    onChange({ ...data, items: items.filter((_, i) => i !== idx) });
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-2">Testimonios</label>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="space-y-1.5 p-3 rounded-lg bg-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-[0.6rem] text-muted">#{i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-xs text-muted hover:text-danger">✕</button>
            </div>
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(i, "name", e.target.value)}
              placeholder="Nombre"
              className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
            />
            <input
              type="text"
              value={item.role || ""}
              onChange={(e) => updateItem(i, "role", e.target.value)}
              placeholder="Rol (ej: Alumno, Competidor...)"
              className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
            />
            <textarea
              value={item.text}
              onChange={(e) => updateItem(i, "text", e.target.value)}
              placeholder="Testimonio"
              rows={2}
              className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none resize-none"
            />
            <input
              type="url"
              value={item.avatar || ""}
              onChange={(e) => updateItem(i, "avatar", e.target.value)}
              placeholder="URL avatar (opcional)"
              className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
            />
          </div>
        ))}
      </div>
      <button onClick={addItem} className="mt-2 text-xs text-a-accent hover:underline">+ Agregar testimonio</button>
    </div>
  );
}

/* ─── Pricing sub-editor ────────────────────────── */

function PricingEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const plans = (data.plans as { name: string; price: string; period?: string; features: string[]; buttonText: string; buttonHref: string; highlighted?: boolean }[]) || [];

  function addPlan() {
    onChange({
      ...data,
      plans: [...plans, { name: "Nuevo plan", price: "0€", period: "/mes", features: ["Caracteristica 1"], buttonText: "Elegir", buttonHref: "#form", highlighted: false }],
    });
  }

  function updatePlan(idx: number, field: string, value: unknown) {
    const updated = [...plans];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ ...data, plans: updated });
  }

  function removePlan(idx: number) {
    onChange({ ...data, plans: plans.filter((_, i) => i !== idx) });
  }

  function updateFeature(planIdx: number, featIdx: number, value: string) {
    const updated = [...plans];
    const feats = [...updated[planIdx].features];
    feats[featIdx] = value;
    updated[planIdx] = { ...updated[planIdx], features: feats };
    onChange({ ...data, plans: updated });
  }

  function addFeature(planIdx: number) {
    const updated = [...plans];
    updated[planIdx] = { ...updated[planIdx], features: [...updated[planIdx].features, ""] };
    onChange({ ...data, plans: updated });
  }

  function removeFeature(planIdx: number, featIdx: number) {
    const updated = [...plans];
    updated[planIdx] = { ...updated[planIdx], features: updated[planIdx].features.filter((_, i) => i !== featIdx) };
    onChange({ ...data, plans: updated });
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-2">Planes</label>
      <div className="space-y-4">
        {plans.map((plan, i) => (
          <div key={i} className="p-3 rounded-lg bg-card-hover space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.6rem] text-muted">Plan #{i + 1}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plan.highlighted || false}
                    onChange={(e) => updatePlan(i, "highlighted", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-[0.6rem] text-muted">Destacado</span>
                </label>
                <button onClick={() => removePlan(i)} className="text-xs text-muted hover:text-danger">✕</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={plan.name}
                onChange={(e) => updatePlan(i, "name", e.target.value)}
                placeholder="Nombre del plan"
                className="rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
              />
              <div className="flex gap-1">
                <input
                  type="text"
                  value={plan.price}
                  onChange={(e) => updatePlan(i, "price", e.target.value)}
                  placeholder="Precio"
                  className="flex-1 rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
                />
                <input
                  type="text"
                  value={plan.period || ""}
                  onChange={(e) => updatePlan(i, "period", e.target.value)}
                  placeholder="/mes"
                  className="w-16 rounded-lg border border-border bg-a-surface px-2 py-2 text-sm focus:border-a-accent focus:outline-none"
                />
              </div>
            </div>
            <input
              type="text"
              value={plan.buttonText}
              onChange={(e) => updatePlan(i, "buttonText", e.target.value)}
              placeholder="Texto del boton"
              className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
            />
            <div>
              <span className="text-[0.6rem] text-muted">Caracteristicas:</span>
              {plan.features.map((feat, fi) => (
                <div key={fi} className="flex gap-1 mt-1">
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => updateFeature(i, fi, e.target.value)}
                    placeholder="Caracteristica"
                    className="flex-1 rounded-lg border border-border bg-a-surface px-3 py-1.5 text-sm focus:border-a-accent focus:outline-none"
                  />
                  <button onClick={() => removeFeature(i, fi)} className="text-xs text-muted hover:text-danger px-1">✕</button>
                </div>
              ))}
              <button onClick={() => addFeature(i)} className="mt-1 text-[0.6rem] text-a-accent hover:underline">+ Caracteristica</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addPlan} className="mt-2 text-xs text-a-accent hover:underline">+ Agregar plan</button>
    </div>
  );
}

/* ─── Stats sub-editor ──────────────────────────── */

function StatsEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const items = (data.items as { value: string; label: string }[]) || [];

  function addItem() {
    onChange({ ...data, items: [...items, { value: "0", label: "Etiqueta" }] });
  }

  function updateItem(idx: number, field: string, value: string) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ ...data, items: updated });
  }

  function removeItem(idx: number) {
    onChange({ ...data, items: items.filter((_, i) => i !== idx) });
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-2">Estadisticas</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={item.value}
              onChange={(e) => updateItem(i, "value", e.target.value)}
              placeholder="Valor (ej: 500+)"
              className="w-28 rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
            />
            <input
              type="text"
              value={item.label}
              onChange={(e) => updateItem(i, "label", e.target.value)}
              placeholder="Etiqueta"
              className="flex-1 rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
            />
            <button onClick={() => removeItem(i)} className="text-xs text-muted hover:text-danger">✕</button>
          </div>
        ))}
      </div>
      <button onClick={addItem} className="mt-2 text-xs text-a-accent hover:underline">+ Agregar estadistica</button>
    </div>
  );
}

/* ─── Features sub-editor ───────────────────────── */

function FeaturesEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const items = (data.items as { icon?: string; title: string; description: string }[]) || [];

  function addItem() {
    onChange({ ...data, items: [...items, { icon: "✓", title: "", description: "" }] });
  }

  function updateItem(idx: number, field: string, value: string) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ ...data, items: updated });
  }

  function removeItem(idx: number) {
    onChange({ ...data, items: items.filter((_, i) => i !== idx) });
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-2">Caracteristicas</label>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="space-y-1.5 p-3 rounded-lg bg-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-[0.6rem] text-muted">#{i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-xs text-muted hover:text-danger">✕</button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={item.icon || ""}
                onChange={(e) => updateItem(i, "icon", e.target.value)}
                placeholder="Icono/Emoji"
                className="w-16 rounded-lg border border-border bg-a-surface px-3 py-2 text-sm text-center focus:border-a-accent focus:outline-none"
              />
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(i, "title", e.target.value)}
                placeholder="Titulo"
                className="flex-1 rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
              />
            </div>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(i, "description", e.target.value)}
              placeholder="Descripcion"
              rows={2}
              className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none resize-none"
            />
          </div>
        ))}
      </div>
      <button onClick={addItem} className="mt-2 text-xs text-a-accent hover:underline">+ Agregar caracteristica</button>
    </div>
  );
}

/* ─── FAQ sub-editor ─────────────────────────────── */

function FaqEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const items = (data.items as { question: string; answer: string }[]) || [];

  function addItem() {
    onChange({ ...data, items: [...items, { question: "", answer: "" }] });
  }

  function updateItem(idx: number, field: string, value: string) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ ...data, items: updated });
  }

  function removeItem(idx: number) {
    onChange({ ...data, items: items.filter((_, i) => i !== idx) });
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-2">Preguntas</label>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="space-y-1.5 p-3 rounded-lg bg-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-[0.6rem] text-muted">#{i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-xs text-muted hover:text-danger">✕</button>
            </div>
            <input
              type="text"
              value={item.question}
              onChange={(e) => updateItem(i, "question", e.target.value)}
              placeholder="Pregunta"
              className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
            />
            <textarea
              value={item.answer}
              onChange={(e) => updateItem(i, "answer", e.target.value)}
              placeholder="Respuesta"
              rows={2}
              className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none resize-none"
            />
          </div>
        ))}
      </div>
      <button onClick={addItem} className="mt-2 text-xs text-a-accent hover:underline">+ Agregar pregunta</button>
    </div>
  );
}
