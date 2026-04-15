"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePostButton({ postId, postTitle }: { postId: string; postTitle: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Eliminar "${postTitle}"? Esta accion no se puede deshacer.`)) return;

    setPending(true);
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Error al eliminar el post");
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="rounded-lg border border-danger/20 px-3 py-1.5 text-xs font-medium text-danger transition-all hover:bg-danger/10 hover:border-danger/40 disabled:opacity-50"
    >
      {pending ? "..." : "Eliminar"}
    </button>
  );
}
