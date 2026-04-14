import { z } from "zod";

export const createImageSchema = z.object({
  url: z.string().min(1, "La URL es obligatoria"),
  key: z.string().min(1, "El key es obligatorio"),
  alt: z.string().max(300).default(""),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  size: z.number().int().positive().optional(),
  mime: z.string().default("image/jpeg"),
  gallery: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  postId: z.string().optional(),
});

export type CreateImageInput = z.infer<typeof createImageSchema>;
