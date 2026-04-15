import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth/session";
import { getConfigSection } from "@/lib/config/get-config";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// POST /api/ai/generate-image
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonResponse({ success: false, error: "No autorizado" }, 403);
  }

  try {
    const body = await req.json();
    const { topic, title } = body as { topic?: string; title?: string };

    const subject = title || topic || "";
    if (subject.trim().length < 3) {
      return jsonResponse(
        { success: false, error: "Se necesita un tema o titulo para generar la imagen" },
        400,
      );
    }

    const aiConfig = await getConfigSection("ai");

    if (aiConfig.provider === "local") {
      return jsonResponse(
        { success: false, error: "La generacion de imagenes solo esta disponible con OpenAI (DALL-E)" },
        400,
      );
    }

    if (!aiConfig.openaiApiKey) {
      return jsonResponse(
        { success: false, error: "API key de OpenAI no configurada. Ve a Configuracion > IA." },
        400,
      );
    }

    // Generate image with DALL-E
    const prompt = `Professional fitness blog cover image for an article titled: "${subject}".
Style: Dark moody atmosphere with black and deep charcoal tones (#030303, #070707).
Subtle gold/amber accent lighting (#c9a84c).
Professional bodybuilding/fitness theme.
Cinematic composition, dramatic lighting.
No text, no watermarks, no logos.
High-end editorial photography style.`;

    const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024",
        quality: "standard",
        response_format: "url",
      }),
    });

    if (!dalleRes.ok) {
      const err = await dalleRes.json().catch(() => ({}));
      throw new Error(
        `DALL-E error (${dalleRes.status}): ${err.error?.message || dalleRes.statusText}`,
      );
    }

    const dalleData = await dalleRes.json();
    const imageUrl = dalleData.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error("DALL-E no devolvio una imagen");
    }

    // Download the image
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error("Error al descargar la imagen generada");
    }

    const imageBuffer = new Uint8Array(await imageRes.arrayBuffer());
    const contentType = imageRes.headers.get("content-type") || "image/png";
    const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? ".jpg" : ".png";

    // Save to uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, imageBuffer);

    const url = `/api/uploads/${filename}`;

    // Create image record in DB
    const image = await prisma.image.create({
      data: {
        url,
        key: filename,
        alt: subject,
        width: 1792,
        height: 1024,
        size: imageBuffer.length,
        mime: contentType.includes("jpeg") ? "image/jpeg" : "image/png",
        gallery: false,
      },
    });

    return jsonResponse({
      success: true,
      data: {
        imageId: image.id,
        url: image.url,
      },
    });
  } catch (err) {
    console.error("[ai/generate-image] Error:", err);
    const message = err instanceof Error ? err.message : "Error al generar imagen";
    return jsonResponse({ success: false, error: message }, 500);
  }
}
