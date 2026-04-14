import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido (solo minúsculas, números y guiones)"),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "El contenido es obligatorio"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  coverId: z.string().optional(),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
