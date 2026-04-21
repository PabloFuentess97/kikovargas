import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const documents = await prisma.clientDocument.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  return success({ documents });
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  fileUrl: z.string().min(1),
  fileKey: z.string().min(1),
  fileSize: z.number().int(),
  fileMime: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const client = await prisma.user.findFirst({ where: { id: clientId, role: "USER" }, select: { id: true } });
  if (!client) return error("Cliente no encontrado", 404);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const doc = await prisma.clientDocument.create({
    data: {
      clientId,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      fileUrl: parsed.data.fileUrl,
      fileKey: parsed.data.fileKey,
      fileSize: parsed.data.fileSize,
      fileMime: parsed.data.fileMime,
      uploadedBy: "COACH",
    },
  });

  return success(doc, 201);
}
