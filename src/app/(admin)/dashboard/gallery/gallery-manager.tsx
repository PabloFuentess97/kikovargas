"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateReactHelpers } from "@uploadthing/react";
import type { UploadRouter } from "@/lib/uploadthing/core";

const { useUploadThing } = generateReactHelpers<UploadRouter>();

interface GalleryImage {
  id: string;
  url: string;
  key: string;
  alt: string;
  width: number | null;
  height: number | null;
  order: number;
}

export function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [error, setError] = useState("");

  const { startUpload } = useUploadThing("galleryImage");

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      setUploading(true);
      setError("");

      try {
        const res = await startUpload(files);
        if (!res) throw new Error("Upload failed");

        for (const file of res) {
          await fetch("/api/images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: file.ufsUrl,
              key: file.key,
              alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
              size: file.size,
              mime: file.type,
              gallery: true,
              order: images.length,
            }),
          });
        }

        router.refresh();
        const galleryRes = await fetch("/api/images?gallery=true");
        const galleryData = await galleryRes.json();
        if (galleryData.success) setImages(galleryData.data);
      } catch {
        setError("Error al subir las imagenes. Intentalo de nuevo.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [startUpload, images.length, router],
  );

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
            {uploading ? "Subiendo..." : "Haz clic para subir imagenes"}
          </span>
          <p className="mt-1 text-xs text-muted">PNG, JPG, WebP hasta 8MB &middot; Maximo 10 a la vez</p>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Image count */}
      <p className="text-sm text-muted">{images.length} imagenes en la galeria</p>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-a-accent/20"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={img.url}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Overlay */}
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
        ))}
      </div>

      {/* Empty state */}
      {images.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-a-accent-dim">
            <svg className="h-6 w-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <p className="text-sm text-muted">No hay imagenes en la galeria</p>
          <p className="mt-1 text-xs text-muted/60">Sube la primera imagen usando el area de arriba</p>
        </div>
      )}
    </div>
  );
}
