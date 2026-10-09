import { z } from 'zod';

export const TIPOS_RECURSO = ['articulo', 'guia_pdf', 'infografia', 'video'] as const;

export const createCategoriaSchema = z.object({
  nombre_categoria: z.string().trim().min(1).max(80),
  descripcion: z.string().trim().max(2000).nullable().optional(),
});

export const updateCategoriaSchema = createCategoriaSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const recursoFields = {
  id_categoria: z.coerce.number().int().positive(),
  titulo: z.string().trim().min(1).max(150),
  contenido: z.string().trim().min(1),
  tipo_recurso: z.enum(TIPOS_RECURSO),
  url_media: z.string().trim().url().max(255).nullable().optional(),
};

export const createRecursoSchema = z.object(recursoFields);

export const updateRecursoSchema = z
  .object({
    id_categoria: recursoFields.id_categoria.optional(),
    titulo: recursoFields.titulo.optional(),
    contenido: recursoFields.contenido.optional(),
    tipo_recurso: recursoFields.tipo_recurso.optional(),
    url_media: recursoFields.url_media,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export const queryParamsSchema = z.object({
  search: z.string().trim().min(1).max(150).optional(),
  id_categoria: z.coerce.number().int().positive().optional(),
  tipo_recurso: z.enum(TIPOS_RECURSO).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['id_recurso', 'titulo', 'tipo_recurso', 'fecha_publicacion']).default('fecha_publicacion'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateCategoriaDTO = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaDTO = z.infer<typeof updateCategoriaSchema>;
export type CreateRecursoDTO = z.infer<typeof createRecursoSchema>;
export type UpdateRecursoDTO = z.infer<typeof updateRecursoSchema>;
export type QueryParamsDTO = z.infer<typeof queryParamsSchema>;