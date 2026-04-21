import { prisma } from "@/lib/db/prisma";
import { requireClientAreaApi } from "@/lib/auth/api-client-access";
import { success } from "@/lib/api-response";

// GET /api/panel/invoices — list client's invoices
export async function GET() {
  const auth = await requireClientAreaApi("invoices");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const invoices = await prisma.invoice.findMany({
    where: { clientId: session!.sub },
    orderBy: [{ status: "asc" }, { issueDate: "desc" }],
  });

  return success({ invoices });
}
