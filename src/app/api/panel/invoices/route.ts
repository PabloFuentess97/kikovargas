import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// GET /api/panel/invoices — list client's invoices
export async function GET() {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const invoices = await prisma.invoice.findMany({
    where: { clientId: session.sub },
    orderBy: [{ status: "asc" }, { issueDate: "desc" }],
  });

  return success({ invoices });
}
