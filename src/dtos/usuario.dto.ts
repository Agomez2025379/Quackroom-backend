import { z } from 'zod';
import { fechaNacimientoSchema } from './auth.dto';
import { ESTADOS_CUENTA } from '../types';

export const updateUserProfileSchema = z
  .object({
    nombre_completo: z.string().trim().min(1, 'El nombre completo no puede estar vacío').max(150).optional(),
    telefono: z.string().trim().max(20).nullable().optional(),
    fecha_nacimiento: fechaNacimientoSchema.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export const updateUserStatusSchema = z.object({
  estado_cuenta: z.enum(ESTADOS_CUENTA),
});

export const listUsuariosQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  id_rol: z.coerce.number().int().positive().optional(),
  estado_cuenta: z.enum(ESTADOS_CUENTA).optional(),
  search: z.string().trim().min(1).max(150).optional(),
});

export type UpdateUserProfileDTO = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserStatusDTO = z.infer<typeof updateUserStatusSchema>;
export type ListUsuariosQueryDTO = z.infer<typeof listUsuariosQuerySchema>;
