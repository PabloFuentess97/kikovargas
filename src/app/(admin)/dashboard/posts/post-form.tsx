"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";
import {
  FormField, FormLabel, FormInput, FormTextarea, FormSelect,
  FormError, FormActions, Button,
} from "@/components/admin/ui";

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
      <FormField>
        <FormLabel htmlFor="title">Titulo</FormLabel>
        <FormInput
          id="title"
          name="title"
          defaultValue={post?.title}
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
        <FormLabel htmlFor="content">Contenido</FormLabel>
        <FormTextarea
          id="content"
          name="content"
          defaultValue={post?.content ?? ""}
          rows={16}
          className="font-mono leading-relaxed resize-y"
          placeholder="Escribe el contenido del post..."
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
