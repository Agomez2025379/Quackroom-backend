import { z } from 'zod';

export const ESTADOS_CITA = ['solicitada', 'confirmada', 'atendida', 'cancelada'] as const;

export const createCitaSchema = z.object({
  id_profesional: z.coerce.number().int().positive(),
  fecha_hora_programada: z
    .string()
    .datetime({ offset: true })
    .refine((value) => Date.parse(value) > Date.now(), {
      message: 'La cita debe programarse para una fecha futura',
    }),
});

function esEnlaceReunionValido(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === 'https:' &&
      (host === 'meet.google.com' ||
        host === 'teams.microsoft.com' ||
        host.endsWith('.teams.microsoft.com') ||
        host === 'teams.live.com' ||
        host.endsWith('.teams.live.com'))
    );
  } catch {
    return false;
  }
}

const enlaceReunionSchema = z
  .string()
  .trim()
  .url()
  .max(255)
  .refine(esEnlaceReunionValido, 'El enlace debe pertenecer a Google Meet o Microsoft Teams');

export const updateEstadoCitaSchema = z.object({
  estado_cita: z.enum(['confirmada', 'atendida', 'cancelada']),
  enlace_reunion: enlaceReunionSchema.nullable().optional(),
  notas_orientacion: z.string().trim().nullable().optional(),
});

export const listCitasQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateCitaDTO = z.infer<typeof createCitaSchema>;
export type UpdateEstadoCitaDTO = z.infer<typeof updateEstadoCitaSchema>;
export type ListCitasQueryDTO = z.infer<typeof listCitasQuerySchema>;
export type EstadoCita = (typeof ESTADOS_CITA)[number];