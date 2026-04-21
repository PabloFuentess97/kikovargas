import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const checkIns = await prisma.clientCheckIn.findMany({
    where: { clientId },
    orderBy: { date: "desc" },
  });

  return success({ checkIns });
}
