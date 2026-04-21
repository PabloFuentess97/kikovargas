import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

const updateSchema = z.object({
  concept: z.string().min(1).max(300).optional(),
  amount: z.number().int().min(0).optional(),
  status: z.enum(["DRAFT", "PENDING", "PAID", "CANCELLED", "OVERDUE"]).optional(),
  issueDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional(),
  pdfUrl: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; invoiceId: string }> }) {
  await requireAdmin();
  const { id: clientId, invoiceId } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const existing = await prisma.invoice.findFirst({ where: { id: invoiceId, clientId }, select: { id: true, status: true } });
  if (!existing) return error("Factura no encontrada", 404);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...parsed.data };
  if (data.issueDate !== undefined) data.issueDate = new Date(data.issueDate);
  if (data.dueDate !== undefined) data.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  // If marking as PAID, set paidAt automatically
  if (parsed.data.status === "PAID" && existing.status !== "PAID") data.paidAt = new Date();
  if (parsed.data.status && parsed.data.status !== "PAID") data.paidAt = null;

  const updated = await prisma.invoice.update({ where: { id: invoiceId }, data });
  return success(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; invoiceId: string }> }) {
  await requireAdmin();
  const { id: clientId, invoiceId } = await params;

  const existing = await prisma.invoice.findFirst({ where: { id: invoiceId, clientId }, select: { id: true } });
  if (!existing) return error("Factura no encontrada", 404);

  await prisma.invoice.delete({ where: { id: invoiceId } });
  return success({ deleted: true });
}
