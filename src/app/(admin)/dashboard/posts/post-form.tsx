"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";

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

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (autoSlug) {
      const slugInput = document.getElementById("slug") as HTMLInputElement | null;
      if (slugInput) slugInput.value = slugify(e.target.value);
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
      content: fd.get("content") as string,
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
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">
          Titulo
        </label>
        <input
          id="title"
          name="title"
          defaultValue={post?.title}
          onChange={handleTitleChange}
          className={`w-full px-4 py-3 text-sm ${fieldErrors.title ? "!border-danger !ring-danger/20" : ""}`}
          placeholder="Mi nuevo articulo"
        />
        {fieldErrors.title && <p className="mt-1.5 text-xs text-danger">{fieldErrors.title}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">
          Slug
          {!isEdit && (
            <button
              type="button"
              onClick={() => setAutoSlug(!autoSlug)}
              className="rounded bg-a-accent-dim px-1.5 py-0.5 text-[0.6rem] font-medium text-a-accent normal-case tracking-normal hover:bg-a-accent/15 transition-colors"
            >
              {autoSlug ? "auto" : "manual"}
            </button>
          )}
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={post?.slug}
          className={`w-full px-4 py-3 text-sm font-mono ${fieldErrors.slug ? "!border-danger !ring-danger/20" : ""}`}
          placeholder="mi-nuevo-articulo"
        />
        {fieldErrors.slug && <p className="mt-1.5 text-xs text-danger">{fieldErrors.slug}</p>}
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">
          Extracto
          <span className="text-[0.6rem] font-normal normal-case tracking-normal text-muted/60">Opcional</span>
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={post?.excerpt ?? ""}
          rows={2}
          className="w-full px-4 py-3 text-sm resize-none"
          placeholder="Breve descripcion del post..."
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">
          Contenido
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={post?.content ?? ""}
          rows={16}
          className={`w-full px-4 py-3 text-sm font-mono leading-relaxed resize-y ${fieldErrors.content ? "!border-danger !ring-danger/20" : ""}`}
          placeholder="Escribe el contenido del post..."
        />
        {fieldErrors.content && <p className="mt-1.5 text-xs text-danger">{fieldErrors.content}</p>}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">
          Estado
        </label>
        <select
          id="status"
          name="status"
          defaultValue={post?.status ?? "DRAFT"}
          className="px-4 py-3 text-sm cursor-pointer"
        >
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Archivado</option>
        </select>
      </div>

      {/* Error banner */}
      {status === "error" && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-lg bg-a-accent px-6 py-2.5 text-sm font-medium text-black transition-all hover:bg-a-accent-hover active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none"
        >
          {status === "saving" ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/posts")}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted transition-all hover:text-foreground hover:border-foreground/20"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
