import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { sendClientWelcomeEmail } from "@/lib/email/client-welcome";

// GET /api/clients — list all clients (role = USER)
export async function GET() {
  await requireAdmin();

  const clients = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
      monthlyFee: true,
      startedAt: true,
      createdAt: true,
      _count: {
        select: {
          workouts: true,
          tasks: true,
          documents: true,
          diets: true,
          invoices: true,
        },
      },
    },
  });

  return success({ clients });
}

// POST /api/clients — create a new client
const createSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
  phone: z.string().max(30).optional(),
  monthlyFee: z.number().int().min(0).optional(),
  startedAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional(),
  sendWelcomeEmail: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  await requireAdmin();

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const { name, email, password, phone, monthlyFee, startedAt, notes, sendWelcomeEmail } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return error("Ya existe un usuario con ese email", 409);

  const hashed = await bcrypt.hash(password, 12);

  const client = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "USER",
      phone: phone ?? null,
      monthlyFee: monthlyFee ?? null,
      startedAt: startedAt ? new Date(startedAt) : null,
      notes: notes ?? "",
    },
    select: { id: true, name: true, email: true },
  });

  // Build panel URL from env (or fallback to request origin)
  const publicUrl = process.env.NEXT_PUBLIC_URL || new URL(req.url).origin;
  const panelUrl = `${publicUrl.replace(/\/$/, "")}/panel`;

  let emailResult: { sent: boolean; error?: string } = { sent: false };
  if (sendWelcomeEmail) {
    try {
      await sendClientWelcomeEmail({
        clientName: name,
        clientEmail: email,
        password,
        panelUrl,
      });
      emailResult = { sent: true };
    } catch (err) {
      emailResult = {
        sent: false,
        error: err instanceof Error ? err.message : "No se pudo enviar el email",
      };
    }
  }

  return success(
    {
      ...client,
      panelUrl,
      // Password is returned ONLY on creation (coach needs to see/share it)
      tempPassword: password,
      emailResult,
    },
    201,
  );
}
