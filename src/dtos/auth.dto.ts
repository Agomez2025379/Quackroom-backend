import { z } from 'zod';

export const fechaNacimientoSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de nacimiento debe tener el formato YYYY-MM-DD')
  .refine((valor) => !Number.isNaN(Date.parse(valor)), 'La fecha de nacimiento no es válida');

export const authRegisterSchema = z.object({
  nombre_completo: z.string().trim().min(1, 'El nombre completo es obligatorio').max(150),
  correo_electronico: z.string().trim().toLowerCase().email('El correo electrónico no es válido').max(100),
  contrasenia: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
  telefono: z.string().trim().max(20).optional(),
  fecha_nacimiento: fechaNacimientoSchema,
  id_rol: z.coerce.number().int().positive('El rol es obligatorio'),
});

export const authLoginSchema = z.object({
  correo_electronico: z.string().trim().toLowerCase().email('El correo electrónico no es válido').max(100),
  contrasenia: z.string().min(1, 'La contraseña es obligatoria').max(72),
});

export type AuthRegisterDTO = z.infer<typeof authRegisterSchema>;
export type AuthLoginDTO = z.infer<typeof authLoginSchema>;
