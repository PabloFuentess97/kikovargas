import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { success, error } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return error("No autenticado", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    return error("Usuario no encontrado", 404);
  }

  return success(user);
}
