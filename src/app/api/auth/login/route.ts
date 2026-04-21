import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { comparePassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { loginSchema } from "@/lib/validations/auth";
import { success, error } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return error("Credenciales inválidas", 401);
    }

    // Admins: deben estar activos. Clientes (role USER) con cuenta inactiva
    // SÍ pueden acceder — entrarán al panel con acceso limitado según la
    // config global (ver lib/auth/client-access.ts).
    if (user.role === "ADMIN" && !user.active) {
      return error("Credenciales inválidas", 401);
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return error("Credenciales inválidas", 401);
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role });

    const response = success({ name: user.name, email: user.email, role: user.role });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return response;
  } catch {
    return error("Error interno del servidor", 500);
  }
}
