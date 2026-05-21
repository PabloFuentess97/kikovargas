# Endpoint /api/health para Coolify

El `Dockerfile` define `HEALTHCHECK` apuntando a `/api/health`.
Crea este archivo si todavía no existe en tu repo:

**Ruta:** `src/app/api/health/route.ts`

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // Light ping a la BD para asegurar conectividad
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 503 }
    );
  }
}
```

Coolify (vía Traefik) usa este endpoint para:
- Marcar el contenedor como "Healthy" antes de enrutar tráfico
- Detectar caídas durante runtime y reiniciar si falla

Si NO añades este endpoint, comenta o quita la directiva `HEALTHCHECK` del Dockerfile.
