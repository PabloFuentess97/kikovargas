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

  // ─── Upload ────────────────────────────────────────
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      setUploading(true);
      setError("");

      try {
        const res = await startUpload(files);
        if (!res) throw new Error("Upload failed");

        // Save each uploaded file to the database
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
        // Refetch images to get the DB records with IDs
        const galleryRes = await fetch("/api/images?gallery=true");
        const galleryData = await galleryRes.json();
        if (galleryData.success) setImages(galleryData.data);
      } catch {
        setError("Error al subir las imágenes. Inténtalo de nuevo.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [startUpload, images.length, router],
  );

  // ─── Delete ────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta imagen?")) return;

    const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
      router.refresh();
    } else {
      setError("Error al eliminar la imagen");
    }
  }

  // ─── Edit alt text ─────────────────────────────────
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
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition-colors ${
          uploading ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-card"
        }`}
      >
        <svg className="h-10 w-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3.75 3.75 0 013.57 5.345A3.75 3.75 0 0118 19.5H6.75z" />
        </svg>
        <div className="text-center">
          <span className="text-sm font-medium text-primary">
            {uploading ? "Subiendo..." : "Haz clic para subir imágenes"}
          </span>
          <p className="mt-1 text-xs text-muted">PNG, JPG, WebP hasta 8MB · Máximo 10 a la vez</p>
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

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Image count */}
      <p className="text-sm text-muted">{images.length} imágenes en la galería</p>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={img.url}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="p-3">
                {editingId === img.id ? (
                  <div className="flex gap-1.5">
                    <input
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveAlt(img.id)}
                      className="flex-1 rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white outline-none placeholder:text-white/50"
                      placeholder="Texto alternativo..."
                      autoFocus
                    />
                    <button
                      onClick={() => saveAlt(img.id)}
                      className="rounded bg-white/20 px-2 py-1 text-xs text-white hover:bg-white/30"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded bg-white/20 px-2 py-1 text-xs text-white hover:bg-white/30"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="truncate text-xs text-white/80">{img.alt || "Sin descripción"}</p>
                    <div className="mt-2 flex gap-1.5">
                      <button
                        onClick={() => startEdit(img)}
                        className="rounded bg-white/20 px-2.5 py-1 text-xs text-white backdrop-blur transition-colors hover:bg-white/30"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="rounded bg-red-500/60 px-2.5 py-1 text-xs text-white backdrop-blur transition-colors hover:bg-red-500/80"
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

      {images.length === 0 && (
        <div className="py-16 text-center text-muted">
          <p className="text-sm">No hay imágenes en la galería todavía.</p>
          <p className="mt-1 text-xs">Sube la primera imagen usando el botón de arriba.</p>
        </div>
      )}
    </div>
  );
}
