import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { PostForm } from "../post-form";

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <div className="admin-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted mb-2">
          <Link href="/dashboard/posts" className="hover:text-a-accent transition-colors">Posts</Link>
          <span>/</span>
          <span>Nuevo</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo post</h1>
        <p className="mt-1 text-sm text-muted">Crea una nueva entrada para el blog.</p>
      </div>
      <div className="max-w-2xl">
        <PostForm />
      </div>
    </div>
  );
}
