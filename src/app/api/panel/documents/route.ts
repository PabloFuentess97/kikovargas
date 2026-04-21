import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// GET /api/panel/documents — list documents shared with logged-in client
export async function GET() {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const documents = await prisma.clientDocument.findMany({
    where: { clientId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  return success({ documents });
}
