import { requireAdmin } from "@/lib/auth/session";
import { PostForm } from "../post-form";
import { PageHeader } from "@/components/admin/ui";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ idea?: string }>;
}) {
  await requireAdmin();
  const { idea } = await searchParams;

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
        <PostForm ideaTopic={idea} />
      </div>
    </div>
  );
}
