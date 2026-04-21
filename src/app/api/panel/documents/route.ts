import { prisma } from "@/lib/db/prisma";
import { requireClientAreaApi } from "@/lib/auth/api-client-access";
import { success } from "@/lib/api-response";

// GET /api/panel/documents — list documents shared with logged-in client
export async function GET() {
  const auth = await requireClientAreaApi("documents");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const documents = await prisma.clientDocument.findMany({
    where: { clientId: session!.sub },
    orderBy: { createdAt: "desc" },
  });

  return success({ documents });
}
