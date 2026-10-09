import { z } from 'zod';
import { fechaNacimientoSchema } from './auth.dto';
import { ESTADOS_CUENTA } from '../types';

export const createAdminUserSchema = z
  .object({
    nombre_completo: z.string().trim().min(1).max(150),
    correo_electronico: z.string().trim().toLowerCase().email().max(100),
    contrasenia: z.string().min(8).max(72),
    nombre_rol: z.enum(['administrador', 'beneficiario', 'profesional']),
    telefono: z.string().trim().max(20).nullable().optional(),
    fecha_nacimiento: fechaNacimientoSchema.nullable().optional(),
    numero_colegiado: z.string().trim().min(1).max(30).optional(),
    especialidad: z.string().trim().min(1).max(100).optional(),
    biografia: z.string().trim().max(2000).nullable().optional(),
    anios_experiencia: z.number().int().min(0).optional(),
  })
  .superRefine((data, context) => {
    if (data.nombre_rol !== 'profesional') return;

    if (!data.numero_colegiado) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['numero_colegiado'],
        message: 'El número de colegiado es obligatorio para profesionales',
      });
    }
    if (!data.especialidad) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['especialidad'],
        message: 'La especialidad es obligatoria para profesionales',
      });
    }
    if (data.anios_experiencia === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['anios_experiencia'],
        message: 'Los años de experiencia son obligatorios para profesionales',
      });
    }
  });

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
export type CreateAdminUserDTO = z.infer<typeof createAdminUserSchema>;
