import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const invoices = await prisma.invoice.findMany({
    where: { clientId },
    orderBy: { issueDate: "desc" },
  });
  return success({ invoices });
}

const createSchema = z.object({
  number: z.string().min(1).max(50),
  concept: z.string().min(1).max(300),
  amount: z.number().int().min(0),          // cents
  currency: z.string().default("EUR"),
  status: z.enum(["DRAFT", "PENDING", "PAID", "CANCELLED", "OVERDUE"]).optional(),
  issueDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const client = await prisma.user.findFirst({ where: { id: clientId, role: "USER" }, select: { id: true } });
  if (!client) return error("Cliente no encontrado", 404);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const existing = await prisma.invoice.findUnique({ where: { number: parsed.data.number } });
  if (existing) return error("Ya existe una factura con ese numero", 409);

  const invoice = await prisma.invoice.create({
    data: {
      clientId,
      number: parsed.data.number,
      concept: parsed.data.concept,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      status: parsed.data.status ?? "PENDING",
      issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : new Date(),
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      notes: parsed.data.notes ?? "",
    },
  });

  return success(invoice, 201);
}
