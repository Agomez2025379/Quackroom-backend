import { z } from 'zod';

export const createPerfilProfesionalSchema = z.object({
  numero_colegiado: z.string().trim().min(1).max(30),
  especialidad: z.string().trim().min(1).max(100),
  biografia: z.string().trim().max(2000).nullable().optional(),
  anios_experiencia: z.coerce.number().int().min(0, 'Los años de experiencia no pueden ser negativos'),
  id_usuario: z.coerce.number().int().positive().optional(),
});

export const updatePerfilProfesionalSchema = z
  .object({
    numero_colegiado: z.string().trim().min(1).max(30).optional(),
    especialidad: z.string().trim().min(1).max(100).optional(),
    biografia: z.string().trim().max(2000).nullable().optional(),
    anios_experiencia: z.coerce.number().int().min(0).optional(),
    disponibilidad: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export const updateDisponibilidadSchema = z.object({
  disponibilidad: z.boolean(),
});

export const listProfesionalesQuerySchema = z.object({
  disponible: z.coerce.boolean().optional(),
  activo: z.coerce.boolean().optional(),
  especialidad: z.string().trim().min(1).max(100).optional(),
  search: z.string().trim().min(1).max(150).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreatePerfilProfesionalDTO = z.infer<typeof createPerfilProfesionalSchema>;
export type UpdatePerfilProfesionalDTO = z.infer<typeof updatePerfilProfesionalSchema>;
export type UpdateDisponibilidadDTO = z.infer<typeof updateDisponibilidadSchema>;
export type ListProfesionalesQueryDTO = z.infer<typeof listProfesionalesQuerySchema>;
