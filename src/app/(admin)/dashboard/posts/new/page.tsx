import { requireAdmin } from "@/lib/auth/session";
import { PostForm } from "../post-form";
import { PageHeader } from "@/components/admin/ui";

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Nuevo post"
        subtitle="Crea una nueva entrada para el blog."
        breadcrumb={[
          { label: "Posts", href: "/dashboard/posts" },
          { label: "Nuevo" },
        ]}
      />
      <div className="max-w-2xl">
        <PostForm />
      </div>
    </div>
  );
}
