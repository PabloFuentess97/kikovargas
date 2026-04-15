"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button, FormLabel } from "@/components/admin/ui";

interface Idea {
  title: string;
  description: string;
  tags: string[];
}

export function IdeasGenerator() {
  const router = useRouter();
  const [niche, setNiche] = useState("");
  const [count, setCount] = useState(5);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Saved ideas (persisted in localStorage)
  const [saved, setSaved] = useState<Idea[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("kv-saved-ideas") || "[]");
    } catch {
      return [];
    }
  });

  function persistSaved(items: Idea[]) {
    setSaved(items);
    localStorage.setItem("kv-saved-ideas", JSON.stringify(items));
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche || undefined, count }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("El servidor devolvio una respuesta inesperada");
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Error al generar ideas");
      }

      setIdeas(data.data.ideas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar ideas");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(idea: Idea, idx: number) {
    navigator.clipboard.writeText(idea.title);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  function handleUseIdea(idea: Idea) {
    // Navigate to new post with the idea title as a query param
    const params = new URLSearchParams({ idea: idea.title });
    router.push(`/dashboard/posts/new?${params.toString()}`);
  }

  function handleSaveIdea(idea: Idea) {
    const exists = saved.some((s) => s.title === idea.title);
    if (!exists) {
      persistSaved([idea, ...saved]);
    }
  }

  function handleRemoveSaved(idx: number) {
    const next = saved.filter((_, i) => i !== idx);
    persistSaved(next);
  }

  return (
    <div className="space-y-8">
      {/* Generator panel */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            <h2 className="text-base font-semibold">Generar ideas con IA</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <FormLabel optional>Nicho o tematica</FormLabel>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Ej: Nutricion deportiva, entrenamiento funcional, suplementacion..."
                className="w-full px-4 py-3 text-sm"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleGenerate())}
              />
              <p className="mt-1 text-[0.6rem] text-muted/60">
                Deja vacio para ideas generales de fitness y bodybuilding
              </p>
            </div>
            <div>
              <FormLabel>Cantidad</FormLabel>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 text-sm"
              >
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>{n} ideas</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="mt-5">
            <Button
              onClick={handleGenerate}
              loading={loading}
              size="lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              {loading ? "Generando ideas..." : "Generar ideas"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated ideas */}
      {ideas.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">
            Ideas generadas ({ideas.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea, idx) => (
              <IdeaCard
                key={idx}
                idea={idea}
                copied={copiedIdx === idx}
                isSaved={saved.some((s) => s.title === idea.title)}
                onCopy={() => handleCopy(idea, idx)}
                onUse={() => handleUseIdea(idea)}
                onSave={() => handleSaveIdea(idea)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Saved ideas */}
      {saved.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted">
              Ideas guardadas ({saved.length})
            </h3>
            <button
              onClick={() => persistSaved([])}
              className="text-[0.65rem] text-muted/50 hover:text-danger transition-colors"
            >
              Limpiar todas
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((idea, idx) => (
              <IdeaCard
                key={`saved-${idx}`}
                idea={idea}
                copied={false}
                isSaved
                onCopy={() => { navigator.clipboard.writeText(idea.title); }}
                onUse={() => handleUseIdea(idea)}
                onRemove={() => handleRemoveSaved(idx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {ideas.length === 0 && saved.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-a-accent/10 mb-4">
            <svg className="w-6 h-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <p className="text-sm text-muted">Escribe una tematica y genera ideas para tus proximos articulos</p>
          <p className="text-[0.65rem] text-muted/50 mt-1">Las ideas se generan con IA segun tu configuracion en Ajustes &gt; IA</p>
        </div>
      )}
    </div>
  );
}

/* ─── Idea Card ───────────────────────────────────── */

function IdeaCard({ idea, copied, isSaved, onCopy, onUse, onSave, onRemove }: {
  idea: Idea;
  copied: boolean;
  isSaved: boolean;
  onCopy: () => void;
  onUse: () => void;
  onSave?: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="admin-card p-4 flex flex-col gap-3 group">
      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {idea.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full text-[0.6rem] font-medium bg-a-accent/10 text-a-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-semibold leading-snug">{idea.title}</h4>

      {/* Description */}
      {idea.description && (
        <p className="text-xs text-muted leading-relaxed line-clamp-3">{idea.description}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">
        <button
          onClick={onUse}
          className="inline-flex items-center gap-1.5 rounded-lg bg-a-accent px-3 py-1.5 text-[0.7rem] font-semibold text-black hover:bg-a-accent-hover transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Crear post
        </button>

        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[0.7rem] font-medium text-muted hover:text-foreground hover:bg-card-hover transition-colors"
          title="Copiar titulo"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copiado
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copiar
            </>
          )}
        </button>

        {onSave && !isSaved && (
          <button
            onClick={onSave}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[0.7rem] font-medium text-muted hover:text-a-accent hover:bg-a-accent/10 transition-colors"
            title="Guardar idea"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            Guardar
          </button>
        )}

        {onRemove && (
          <button
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[0.7rem] font-medium text-muted hover:text-danger hover:bg-danger/5 transition-colors ml-auto"
            title="Eliminar"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
