import { z } from 'zod';

export const createCentroAtencionSchema = z.object({
  nombre_centro: z.string().trim().min(1).max(150),
  direccion: z.string().trim().min(1).max(200),
  telefono: z.string().trim().min(1).max(20),
  servicios_ofrecidos: z.string().trim().min(1),
});

export const updateCentroAtencionSchema = z
  .object({
    nombre_centro: z.string().trim().min(1).max(150).optional(),
    direccion: z.string().trim().min(1).max(200).optional(),
    telefono: z.string().trim().min(1).max(20).optional(),
    servicios_ofrecidos: z.string().trim().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export const queryCentroSchema = z.object({
  search: z.string().trim().min(1).max(150).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['id_centro', 'nombre_centro']).default('nombre_centro'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateCentroAtencionDTO = z.infer<typeof createCentroAtencionSchema>;
export type UpdateCentroAtencionDTO = z.infer<typeof updateCentroAtencionSchema>;
export type QueryCentroDTO = z.infer<typeof queryCentroSchema>;