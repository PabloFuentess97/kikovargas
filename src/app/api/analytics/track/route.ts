import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { success } from "@/lib/api-response";
import { z } from "zod";

const trackSchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(1000).default(""),
});

function parseUserAgent(ua: string) {
  let device = "desktop";
  if (/mobile|android.*mobile|iphone|ipod/i.test(ua)) device = "mobile";
  else if (/tablet|ipad|android(?!.*mobile)/i.test(ua)) device = "tablet";

  let browser = "other";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome|chromium|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/opera|opr/i.test(ua)) browser = "Opera";

  let os = "other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

  return { device, browser, os };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) return success({ tracked: false });

    const ua = req.headers.get("user-agent") ?? "";
    const { device, browser, os } = parseUserAgent(ua);

    // IP: check common proxy/CDN headers
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "";

    // Geo: Vercel provides these automatically on deployed apps
    const country = req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? "";
    const city = req.headers.get("x-vercel-ip-city") ?? req.headers.get("cf-ipcity") ?? "";

    await prisma.pageView.create({
      data: {
        path: parsed.data.path,
        referrer: parsed.data.referrer,
        userAgent: ua.slice(0, 500),
        ip,
        country,
        city,
        device,
        browser,
        os,
      },
    });

    return success({ tracked: true });
  } catch {
    // Never fail — analytics should be silent
    return success({ tracked: false });
  }
}
