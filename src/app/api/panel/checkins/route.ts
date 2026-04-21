import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireClientAreaApi } from "@/lib/auth/api-client-access";
import { success, error } from "@/lib/api-response";

// GET /api/panel/checkins — logged-in client's check-ins
export async function GET() {
  const auth = await requireClientAreaApi("progress");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const checkIns = await prisma.clientCheckIn.findMany({
    where: { clientId: session!.sub },
    orderBy: { date: "desc" },
  });

  return success({ checkIns });
}

const createSchema = z.object({
  date: z.string().datetime(),
  weightKg: z.number().min(20).max(400).optional().nullable(),
  photoFrontUrl: z.string().optional().nullable(),
  photoFrontKey: z.string().optional().nullable(),
  photoSideUrl: z.string().optional().nullable(),
  photoSideKey: z.string().optional().nullable(),
  photoBackUrl: z.string().optional().nullable(),
  photoBackKey: z.string().optional().nullable(),
  notes: z.string().max(2000).optional(),
});

// POST /api/panel/checkins — client creates a new check-in
export async function POST(req: NextRequest) {
  const auth = await requireClientAreaApi("progress");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const checkIn = await prisma.clientCheckIn.create({
    data: {
      clientId: session!.sub,
      date: new Date(parsed.data.date),
      weightKg: parsed.data.weightKg ?? null,
      photoFrontUrl: parsed.data.photoFrontUrl ?? null,
      photoFrontKey: parsed.data.photoFrontKey ?? null,
      photoSideUrl: parsed.data.photoSideUrl ?? null,
      photoSideKey: parsed.data.photoSideKey ?? null,
      photoBackUrl: parsed.data.photoBackUrl ?? null,
      photoBackKey: parsed.data.photoBackKey ?? null,
      notes: parsed.data.notes ?? "",
    },
  });

  return success(checkIn, 201);
}
