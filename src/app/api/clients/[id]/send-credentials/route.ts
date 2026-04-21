import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { sendClientWelcomeEmail } from "@/lib/email/client-welcome";

const schema = z.object({
  // Opcional: si viene, se resetea la contraseña del cliente a este valor antes de enviarla
  // Si no viene, se genera una nueva (porque la original está hasheada y no se puede recuperar)
  newPassword: z.string().min(8).max(100).optional(),
});

// POST /api/clients/:id/send-credentials — (re)enviar credenciales por email
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const client = await prisma.user.findFirst({
    where: { id, role: "USER" },
    select: { id: true, name: true, email: true },
  });
  if (!client) return error("Cliente no encontrado", 404);

  // La contraseña bcryptada no es recuperable: si se quiere reenviar, hay que establecer una nueva
  const passwordToSend = parsed.data.newPassword || generateTempPassword();
  const hashed = await bcrypt.hash(passwordToSend, 12);
  await prisma.user.update({ where: { id }, data: { password: hashed } });

  const publicUrl = process.env.NEXT_PUBLIC_URL || new URL(req.url).origin;
  const panelUrl = `${publicUrl.replace(/\/$/, "")}/panel`;

  try {
    await sendClientWelcomeEmail({
      clientName: client.name,
      clientEmail: client.email,
      password: passwordToSend,
      panelUrl,
    });
    return success({
      sent: true,
      tempPassword: passwordToSend,
      panelUrl,
    });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "No se pudo enviar el email",
      500,
    );
  }
}

function generateTempPassword(): string {
  // 12 chars mix — legible sin caracteres confusos (0/O/l/1)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 12; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
