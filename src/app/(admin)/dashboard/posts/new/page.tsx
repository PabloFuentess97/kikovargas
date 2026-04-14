import { requireAdmin } from "@/lib/auth/session";
import { PostForm } from "../post-form";

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Nuevo post</h1>
      <p className="mt-1 text-sm text-muted">Crea una nueva entrada para el blog.</p>
      <div className="mt-8 max-w-2xl">
        <PostForm />
      </div>
    </div>
  );
}
