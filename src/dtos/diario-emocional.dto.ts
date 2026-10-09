import { z } from 'zod';

const fechaSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'La fecha debe tener un formato válido',
});

export const createDiarioRegistroSchema = z.object({
  nivel_animo: z.number().int().min(1).max(5),
  emocion_principal: z.string().trim().min(1).max(50),
  notas_personales: z.string().trim().nullable().optional(),
});

export const queryDiarioSchema = z
  .object({
    fecha_inicio: fechaSchema.optional(),
    fecha_fin: fechaSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  })
  .refine(
    ({ fecha_inicio, fecha_fin }) =>
      !fecha_inicio || !fecha_fin || Date.parse(fecha_inicio) <= Date.parse(fecha_fin),
    { path: ['fecha_fin'], message: 'La fecha_fin no puede ser anterior a fecha_inicio' },
  );

export type CreateDiarioRegistroDTO = z.infer<typeof createDiarioRegistroSchema>;
export type QueryDiarioDTO = z.infer<typeof queryDiarioSchema>;