import { z } from 'zod';

export const createResenaSchema = z.object({
  calificacion: z.number().int().min(1).max(5),
  comentario: z.string().trim().nullable().optional(),
});

export type CreateResenaDTO = z.infer<typeof createResenaSchema>;