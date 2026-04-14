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
      setErrorMsg(err instanceof Error ? err.message : "Error de conexión");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1.5">Título</label>
        <input
          id="title"
          name="title"
          defaultValue={post?.title}
          onChange={handleTitleChange}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 ${fieldErrors.title ? "border-red-400" : "border-border"}`}
          placeholder="Mi nuevo artículo"
        />
        {fieldErrors.title && <p className="mt-1 text-xs text-red-500">{fieldErrors.title}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1.5">
          Slug
          {!isEdit && (
            <button
              type="button"
              onClick={() => setAutoSlug(!autoSlug)}
              className="ml-2 text-xs text-muted hover:text-primary"
            >
              ({autoSlug ? "auto" : "manual"})
            </button>
          )}
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={post?.slug}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm font-mono outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 ${fieldErrors.slug ? "border-red-400" : "border-border"}`}
          placeholder="mi-nuevo-articulo"
        />
        {fieldErrors.slug && <p className="mt-1 text-xs text-red-500">{fieldErrors.slug}</p>}
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-1.5">
          Extracto <span className="text-muted font-normal">Opcional</span>
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={post?.excerpt ?? ""}
          rows={2}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
          placeholder="Breve descripción del post..."
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1.5">Contenido</label>
        <textarea
          id="content"
          name="content"
          defaultValue={post?.content ?? ""}
          rows={16}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm font-mono leading-relaxed outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 resize-y ${fieldErrors.content ? "border-red-400" : "border-border"}`}
          placeholder="Escribe el contenido del post..."
        />
        {fieldErrors.content && <p className="mt-1 text-xs text-red-500">{fieldErrors.content}</p>}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-1.5">Estado</label>
        <select
          id="status"
          name="status"
          defaultValue={post?.status ?? "DRAFT"}
          className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
        >
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Archivado</option>
        </select>
      </div>

      {/* Error banner */}
      {status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {status === "saving" ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/posts")}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-card"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
