import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  email: z.string().email("Email inválido"),
  phone: z.string().max(20).optional(),
  subject: z.string().min(1, "El asunto es obligatorio").max(200),
  message: z.string().min(1, "El mensaje es obligatorio").max(5000),
});

export const updateContactStatusSchema = z.object({
  status: z.enum(["PENDING", "READ", "REPLIED", "ARCHIVED"]),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
