"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";
import {
  FormField, FormLabel, FormInput, FormTextarea, FormSelect,
  FormError, FormActions, Button,
} from "@/components/admin/ui";
import { TiptapEditor } from "@/components/admin/tiptap-editor";

interface PostData {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  status?: string;
}

type FieldErrors = Partial<Record<"title" | "slug" | "excerpt" | "content" | "status", string>>;

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PostForm({ post }: { post?: PostData }) {
  const router = useRouter();
  const isEdit = Boolean(post?.id);

  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const contentRef = useRef(post?.content ?? "");

  // AI generation state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiContext, setAiContext] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Editor key for forcing re-render when AI fills content
  const [editorKey, setEditorKey] = useState(0);
  const [formTitle, setFormTitle] = useState(post?.title ?? "");
  const [formContent, setFormContent] = useState(post?.content ?? "");

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormTitle(e.target.value);
    if (autoSlug) {
      const slugInput = document.getElementById("slug") as HTMLInputElement | null;
      if (slugInput) slugInput.value = slugify(e.target.value);
    }
  }

  async function handleAiGenerate() {
    if (aiTopic.trim().length < 3) {
      setAiError("El tema debe tener al menos 3 caracteres");
      return;
    }

    setAiLoading(true);
    setAiError("");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          context: aiContext || undefined,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("El servidor devolvio una respuesta inesperada");
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Error al generar");
      }

      const { title, content } = data.data;

      // Fill form fields
      setFormTitle(title);
      const titleInput = document.getElementById("title") as HTMLInputElement;
      if (titleInput) titleInput.value = title;

      if (autoSlug) {
        const slugInput = document.getElementById("slug") as HTMLInputElement;
        if (slugInput) slugInput.value = slugify(title);
      }

      // Update editor content
      setFormContent(content);
      contentRef.current = content;
      setEditorKey((k) => k + 1); // Force editor re-render

      // Close AI panel
      setAiOpen(false);
      setAiTopic("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Error al generar contenido");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const raw = {
      title: fd.get("title") as string,
      slug: fd.get("slug") as string,
      excerpt: (fd.get("excerpt") as string) || undefined,
      content: contentRef.current,
      status: fd.get("status") as string,
    };

    const schema = isEdit ? updatePostSchema : createPostSchema;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setStatus("saving");

    try {
      const url = isEdit ? `/api/posts/${post!.id}` : "/api/posts";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      router.push("/dashboard/posts");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error de conexion");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* AI Generate Button */}
      {!isEdit && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAiOpen(!aiOpen)}
            className={`inline-flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              aiOpen
                ? "bg-a-accent text-black"
                : "bg-a-accent/10 text-a-accent border border-a-accent/20 hover:bg-a-accent/20"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            Generar con IA
          </button>
          {aiOpen && (
            <span className="text-xs text-muted">
              Se guardara como borrador
            </span>
          )}
        </div>
      )}

      {/* AI Panel */}
      {aiOpen && (
        <div className="rounded-xl border border-a-accent/20 bg-a-accent/[0.03] p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-sm font-semibold text-a-accent">Generacion con IA</span>
          </div>

          <div>
            <FormLabel>Tema del articulo</FormLabel>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="Ej: Los beneficios del entrenamiento de fuerza para principiantes"
              className="w-full px-4 py-3 text-sm"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAiGenerate())}
            />
          </div>

          <div>
            <FormLabel optional>
              Contexto personalizado
            </FormLabel>
            <textarea
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 text-sm resize-none"
              placeholder="Instrucciones adicionales para este articulo (opcional)..."
            />
            <p className="mt-1 text-[0.6rem] text-muted/60">
              Se suma al contexto global de Ajustes &gt; IA
            </p>
          </div>

          {aiError && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {aiError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={aiLoading || aiTopic.trim().length < 3}
              className="inline-flex items-center gap-2 rounded-lg bg-a-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-a-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generando...
                </>
              ) : (
                "Generar articulo"
              )}
            </button>
            <button
              type="button"
              onClick={() => setAiOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <FormField>
        <FormLabel htmlFor="title">Titulo</FormLabel>
        <FormInput
          id="title"
          name="title"
          defaultValue={formTitle}
          key={`title-${editorKey}`}
          onChange={handleTitleChange}
          placeholder="Mi nuevo articulo"
          error={fieldErrors.title}
        />
      </FormField>

      <FormField>
        <FormLabel
          htmlFor="slug"
          aside={
            !isEdit ? (
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="rounded bg-a-accent-dim px-1.5 py-0.5 text-[0.6rem] font-medium text-a-accent normal-case tracking-normal hover:bg-a-accent/15 transition-colors"
              >
                {autoSlug ? "auto" : "manual"}
              </button>
            ) : undefined
          }
        >
          Slug
        </FormLabel>
        <FormInput
          id="slug"
          name="slug"
          defaultValue={post?.slug}
          className="font-mono"
          placeholder="mi-nuevo-articulo"
          error={fieldErrors.slug}
        />
      </FormField>

      <FormField>
        <FormLabel htmlFor="excerpt" optional>Extracto</FormLabel>
        <FormTextarea
          id="excerpt"
          name="excerpt"
          defaultValue={post?.excerpt ?? ""}
          rows={2}
          className="resize-none"
          placeholder="Breve descripcion del post..."
        />
      </FormField>

      <FormField>
        <FormLabel>Contenido</FormLabel>
        <TiptapEditor
          key={editorKey}
          content={formContent}
          onChange={(html) => { contentRef.current = html; }}
          error={fieldErrors.content}
        />
      </FormField>

      <FormField>
        <FormLabel htmlFor="status">Estado</FormLabel>
        <FormSelect id="status" name="status" defaultValue={post?.status ?? "DRAFT"}>
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Archivado</option>
        </FormSelect>
      </FormField>

      {status === "error" && <FormError message={errorMsg} />}

      <FormActions>
        <Button type="submit" loading={status === "saving"} size="lg">
          {isEdit ? "Guardar cambios" : "Crear post"}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => router.push("/dashboard/posts")}>
          Cancelar
        </Button>
      </FormActions>
    </form>
  );
}
