"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface GalleryImage {
  id: string;
  url: string;
  key: string;
  alt: string;
  width: number | null;
  height: number | null;
  order: number;
  gallery: boolean;
}

type Filter = "all" | "featured" | "unfeatured";

export function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [previews, setPreviews] = useState<string[]>([]);

  const filtered = images.filter((img) => {
    if (filter === "featured") return img.gallery;
    if (filter === "unfeatured") return !img.gallery;
    return true;
  });

  const featuredCount = images.filter((img) => img.gallery).length;
  // First 8 with gallery=true actually render on the home hero grid
  const HOME_LIMIT = 8;
  const homeIds = new Set(
    images.filter((img) => img.gallery).slice(0, HOME_LIMIT).map((img) => img.id),
  );

  async function moveImage(id: string, direction: -1 | 1) {
    const idx = images.findIndex((img) => img.id === id);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    // Swap locally for instant feedback
    const next = [...images];
    [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
    setImages(next);

    // Persist full order
    const res = await fetch("/api/images/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((img) => img.id) }),
    });

    if (!res.ok) {
      setError("Error al reordenar");
      // Revert
      setImages(images);
    } else {
      router.refresh();
    }
  }

  /** Upload selected files to local API, then save metadata */
  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      // Show previews
      const previewUrls = files.map((f) => URL.createObjectURL(f));
      setPreviews(previewUrls);

      setUploading(true);
      setError("");
      setUploadProgress(`Subiendo ${files.length} ${files.length === 1 ? "archivo" : "archivos"}...`);

      try {
        // 1. Upload files to /api/upload
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        // Handle non-JSON responses (e.g. nginx 413, redirect to login, etc.)
        const contentType = uploadRes.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await uploadRes.text();
          console.error("[upload] Non-JSON response:", uploadRes.status, text.slice(0, 200));
          if (uploadRes.status === 413) {
            throw new Error("Archivo(s) demasiado grandes. El servidor rechaza la peticion. Revisa la configuracion de nginx (client_max_body_size).");
          }
          if (uploadRes.status === 401 || uploadRes.status === 302) {
            throw new Error("Sesion expirada. Recarga la pagina e intenta de nuevo.");
          }
          throw new Error(`Error del servidor (${uploadRes.status}). Revisa los logs del contenedor.`);
        }

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Error al subir archivos");
        }

        const { uploaded, errors: uploadErrors } = uploadData.data;

        if (uploadErrors && uploadErrors.length > 0) {
          setError(uploadErrors.join(" "));
        }

        if (!uploaded || uploaded.length === 0) {
          throw new Error("No se subio ningun archivo");
        }

        // 2. Save each uploaded file as an image record
        setUploadProgress(`Guardando ${uploaded.length} ${uploaded.length === 1 ? "imagen" : "imagenes"}...`);
        const saveErrors: string[] = [];

        for (const file of uploaded) {
          const res = await fetch("/api/images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: file.url,
              key: file.key,
              alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
              size: file.size,
              mime: file.mime,
              gallery: true,
              order: images.length,
            }),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => null);
            saveErrors.push(data?.error || `Error guardando ${file.name}`);
          }
        }

        if (saveErrors.length > 0) {
          setError((prev) => [prev, ...saveErrors].filter(Boolean).join(". "));
        }

        // 3. Refresh image list from server
        router.refresh();
        const galleryRes = await fetch("/api/images");
        const galleryData = await galleryRes.json();
        if (galleryData.success) setImages(galleryData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir las imagenes");
      } finally {
        setUploading(false);
        setUploadProgress("");
        setPreviews([]);
        // Clean up preview URLs
        previewUrls.forEach((u) => URL.revokeObjectURL(u));
        e.target.value = "";
      }
    },
    [images.length, router],
  );

  async function toggleGallery(id: string, current: boolean) {
    const res = await fetch(`/api/images/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gallery: !current }),
    });

    if (res.ok) {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, gallery: !current } : img)),
      );
      router.refresh();
    } else {
      setError("Error al actualizar la imagen");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar esta imagen?")) return;

    const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
      router.refresh();
    } else {
      setError("Error al eliminar la imagen");
    }
  }

  function startEdit(img: GalleryImage) {
    setEditingId(img.id);
    setEditAlt(img.alt);
  }

  async function saveAlt(id: string) {
    const res = await fetch(`/api/images/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt: editAlt }),
    });

    if (res.ok) {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, alt: editAlt } : img)),
      );
      setEditingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 transition-all ${
          uploading
            ? "border-a-accent/40 bg-a-accent-dim"
            : "border-border hover:border-a-accent/30 hover:bg-card"
        }`}
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${uploading ? "bg-a-accent/15" : "bg-a-accent-dim"}`}>
          <svg className={`h-6 w-6 transition-colors ${uploading ? "text-a-accent" : "text-muted"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3.75 3.75 0 013.57 5.345A3.75 3.75 0 0118 19.5H6.75z" />
          </svg>
        </div>
        <div className="text-center">
          <span className="text-sm font-medium text-a-accent">
            {uploading ? uploadProgress || "Subiendo..." : "Haz clic para subir imagenes"}
          </span>
          <p className="mt-1 text-xs text-muted">PNG, JPG, WebP hasta 5MB &middot; Maximo 10 a la vez</p>
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading}
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-a-surface border border-border">
              <img src={src} alt="Preview" className="w-full h-full object-cover opacity-60" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-3 text-xs text-danger/60 hover:text-danger underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Stats + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted">
          {images.length} {images.length === 1 ? "imagen" : "imagenes"} &middot;{" "}
          <span className="text-a-accent">{featuredCount} en landing</span>
          {" "}&middot;{" "}
          <span className="text-foreground">
            {Math.min(featuredCount, HOME_LIMIT)} visibles en la home
          </span>
        </p>
        <div className="flex gap-1 p-0.5 rounded-lg bg-a-surface border border-border">
          {([
            { key: "all", label: "Todas" },
            { key: "featured", label: "En landing" },
            { key: "unfeatured", label: "Ocultas" },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-a-accent text-black"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Home limit hint */}
      {featuredCount > HOME_LIMIT && (
        <div className="rounded-lg border border-a-accent/20 bg-a-accent/5 px-4 py-3 text-xs text-foreground leading-relaxed">
          <strong className="text-a-accent">Nota:</strong> tienes {featuredCount} imágenes marcadas como landing, pero la home solo muestra las primeras {HOME_LIMIT}. Usa las flechas <span className="font-mono">↑ ↓</span> en cada tarjeta para reordenar y decidir cuáles salen.
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((img) => {
          const globalIdx = images.findIndex((i) => i.id === img.id);
          const canMoveUp = globalIdx > 0;
          const canMoveDown = globalIdx < images.length - 1;
          const isOnHome = homeIds.has(img.id);
          return (
          <div
            key={img.id}
            className={`group relative overflow-hidden rounded-xl border bg-card transition-all ${
              img.gallery
                ? "border-a-accent/30 ring-1 ring-a-accent/10"
                : "border-border hover:border-a-accent/20"
            }`}
          >
            <div className="aspect-[4/5] overflow-hidden bg-a-surface">
              <img
                src={img.url}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  el.parentElement!.innerHTML = `
                    <div class="h-full w-full flex flex-col items-center justify-center text-muted/40 gap-2">
                      <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                      </svg>
                      <span class="text-[0.55rem] uppercase tracking-wider">URL invalida</span>
                    </div>
                  `;
                }}
              />
            </div>

            {/* Featured badges */}
            {img.gallery && (
              <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                <div className="bg-a-accent/90 text-black px-2 py-0.5 rounded-md text-[0.55rem] font-semibold uppercase tracking-wider">
                  Landing
                </div>
                {isOnHome && (
                  <div className="bg-success/90 text-white px-2 py-0.5 rounded-md text-[0.55rem] font-semibold uppercase tracking-wider">
                    En home
                  </div>
                )}
              </div>
            )}

            {/* Reorder buttons — always visible (mobile-friendly) */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              <button
                onClick={() => moveImage(img.id, -1)}
                disabled={!canMoveUp}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/70 text-white backdrop-blur-sm hover:bg-black/90 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-all"
                title="Subir (aparece antes en la landing)"
                aria-label="Subir"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
              <button
                onClick={() => moveImage(img.id, 1)}
                disabled={!canMoveDown}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/70 text-white backdrop-blur-sm hover:bg-black/90 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-all"
                title="Bajar (aparece despues en la landing)"
                aria-label="Bajar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            {/* Featured toggle button */}
            <button
              onClick={() => toggleGallery(img.id, img.gallery)}
              className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                img.gallery
                  ? "bg-a-accent text-black"
                  : "bg-black/60 text-white/50 hover:text-a-accent hover:bg-black/80"
              }`}
              title={img.gallery ? "Quitar del landing" : "Mostrar en landing"}
            >
              <svg className="w-4 h-4" fill={img.gallery ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </button>

            {/* Overlay with actions */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="p-3">
                {editingId === img.id ? (
                  <div className="flex gap-1.5">
                    <input
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveAlt(img.id)}
                      className="flex-1 rounded-md border border-white/20 bg-black/60 px-2.5 py-1.5 text-xs text-white outline-none placeholder:text-white/40 focus:border-a-accent/50"
                      placeholder="Texto alternativo..."
                      autoFocus
                    />
                    <button onClick={() => saveAlt(img.id)} className="rounded-md bg-a-accent/80 px-2.5 py-1.5 text-xs font-medium text-black hover:bg-a-accent">
                      OK
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-md bg-white/15 px-2.5 py-1.5 text-xs text-white hover:bg-white/25">
                      X
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="truncate text-xs text-white/70 mb-2">{img.alt || "Sin descripcion"}</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => startEdit(img)}
                        className="rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="rounded-md bg-danger/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-danger/70"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Empty states */}
      {images.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-a-accent-dim">
            <svg className="h-6 w-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <p className="text-sm text-muted">No hay imagenes</p>
          <p className="mt-1 text-xs text-muted/60">Sube la primera imagen usando el area de arriba</p>
        </div>
      )}

      {filtered.length === 0 && images.length > 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-muted">No hay imagenes con este filtro</p>
        </div>
      )}
    </div>
  );
}
