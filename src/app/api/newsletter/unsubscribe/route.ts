import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/newsletter/unsubscribe?email=... — public link in emails
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return new NextResponse("Email requerido", { status: 400 });
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({ where: { email } });

    if (subscriber && subscriber.active) {
      await prisma.subscriber.update({
        where: { email },
        data: { active: false, unsubscribedAt: new Date() },
      });
    }

    // Return a simple HTML page confirming unsubscribe
    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Suscripcion cancelada</title>
<style>
  body { margin:0; padding:40px 20px; background:#030303; color:#ededed; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; text-align:center; }
  .card { max-width:400px; margin:80px auto; padding:40px; background:#0a0a0a; border-radius:12px; border:1px solid #1a1a1a; }
  h1 { font-size:20px; margin:0 0 12px; }
  p { color:#777; font-size:14px; line-height:1.6; margin:0 0 20px; }
  a { color:#c9a84c; text-decoration:none; font-size:14px; }
</style>
</head>
<body>
  <div class="card">
    <h1>Suscripcion cancelada</h1>
    <p>Tu email <strong>${email}</strong> ha sido removido de nuestra lista. No recibiras mas correos.</p>
    <a href="/">Volver al sitio</a>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("[newsletter/unsubscribe] Error:", err);
    return new NextResponse("Error al cancelar suscripcion", { status: 500 });
  }
}
