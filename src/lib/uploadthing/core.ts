import { createUploadthing, type FileRouter } from "uploadthing/next";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

const f = createUploadthing();

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const payload = verifyToken(token);
  if (payload.role !== "ADMIN") throw new Error("Forbidden");

  return payload;
}

export const uploadRouter = {
  galleryImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const user = await requireAuth();
      return { userId: user.sub };
    })
    .onUploadComplete(({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl, key: file.key, name: file.name, size: file.size };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
