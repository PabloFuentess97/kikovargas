"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/admin/ui";

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
    <Button variant="danger" size="sm" onClick={handleDelete} loading={pending}>
      Eliminar
    </Button>
  );
}
