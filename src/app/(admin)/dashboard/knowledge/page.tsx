import { requireAdmin } from "@/lib/auth/session";
import { KnowledgeBase } from "./knowledge-base";

export default async function KnowledgePage() {
  await requireAdmin();

  return (
    <div className="admin-fade-in">
      <KnowledgeBase />
    </div>
  );
}
