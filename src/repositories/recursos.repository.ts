import { supabase } from '../config/supabase';
import type {
  CreateCategoriaDTO,
  CreateRecursoDTO,
  QueryParamsDTO,
  UpdateCategoriaDTO,
  UpdateRecursoDTO,
} from '../dtos/recursos.dto';

const CATEGORIAS_TABLE = 'categorias_recursos';
const RECURSOS_TABLE = 'recursos_educativos';
const RECURSO_SELECT =
  'id_recurso, id_categoria, id_autor_usuario, titulo, contenido, tipo_recurso, url_media, fecha_publicacion, categorias_recursos(id_categoria, nombre_categoria), usuarios(id_usuario, nombre_completo)';

export interface CategoriaRecurso {
  id_categoria: number;
  nombre_categoria: string;
  descripcion: string | null;
}

export interface RecursoEducativo {
  id_recurso: number;
  id_categoria: number;
  id_autor_usuario: number;
  titulo: string;
  contenido: string;
  tipo_recurso: CreateRecursoDTO['tipo_recurso'];
  url_media: string | null;
  fecha_publicacion: string;
  categorias_recursos:
    | { id_categoria: number; nombre_categoria: string }
    | { id_categoria: number; nombre_categoria: string }[]
    | null;
  usuarios:
    | { id_usuario: number; nombre_completo: string }
    | { id_usuario: number; nombre_completo: string }[]
    | null;
}

export interface ListRecursosFilters extends QueryParamsDTO {}

export const recursosRepository = {
  async findAllCategorias(): Promise<CategoriaRecurso[]> {
    const { data, error } = await supabase
      .from(CATEGORIAS_TABLE)
      .select('id_categoria, nombre_categoria, descripcion')
      .order('nombre_categoria', { ascending: true });
    if (error) throw error;
    return (data ?? []) as CategoriaRecurso[];
  },

  async createCategoria(payload: CreateCategoriaDTO): Promise<CategoriaRecurso> {
    const { data, error } = await supabase
      .from(CATEGORIAS_TABLE)
      .insert(payload)
      .select('id_categoria, nombre_categoria, descripcion')
      .single();
    if (error) throw error;
    return data as CategoriaRecurso;
  },

  async updateCategoria(id: number, payload: UpdateCategoriaDTO): Promise<CategoriaRecurso | null> {
    const { data, error } = await supabase
      .from(CATEGORIAS_TABLE)
      .update(payload)
      .eq('id_categoria', id)
      .select('id_categoria, nombre_categoria, descripcion')
      .maybeSingle();
    if (error) throw error;
    return data as CategoriaRecurso | null;
  },

  async deleteCategoria(id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from(CATEGORIAS_TABLE)
      .delete()
      .eq('id_categoria', id)
      .select('id_categoria')
      .maybeSingle();
    if (error) throw error;
    return data !== null;
  },

  async findAllRecursos(
    filters: ListRecursosFilters,
  ): Promise<{ rows: RecursoEducativo[]; total: number }> {
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    let query = supabase
      .from(RECURSOS_TABLE)
      .select(RECURSO_SELECT, { count: 'exact' })
      .order(filters.sortBy, { ascending: filters.order === 'asc' })
      .range(from, to);

    if (filters.id_categoria !== undefined) {
      query = query.eq('id_categoria', filters.id_categoria);
    }
    if (filters.tipo_recurso !== undefined) {
      query = query.eq('tipo_recurso', filters.tipo_recurso);
    }
    if (filters.search) {
      const term = filters.search.replace(/[\\,()]/g, '\\$&');
      query = query.or(`titulo.ilike.%${term}%,contenido.ilike.%${term}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { rows: (data ?? []) as RecursoEducativo[], total: count ?? 0 };
  },

  async findRecursoById(id: number): Promise<RecursoEducativo | null> {
    const { data, error } = await supabase
      .from(RECURSOS_TABLE)
      .select(RECURSO_SELECT)
      .eq('id_recurso', id)
      .maybeSingle();
    if (error) throw error;
    return data as RecursoEducativo | null;
  },

  async createRecurso(payload: CreateRecursoDTO & { id_autor_usuario: number }): Promise<RecursoEducativo> {
    const { data, error } = await supabase
      .from(RECURSOS_TABLE)
      .insert(payload)
      .select(RECURSO_SELECT)
      .single();
    if (error) throw error;
    return data as RecursoEducativo;
  },

  async updateRecurso(id: number, payload: UpdateRecursoDTO): Promise<RecursoEducativo | null> {
    const { data, error } = await supabase
      .from(RECURSOS_TABLE)
      .update(payload)
      .eq('id_recurso', id)
      .select(RECURSO_SELECT)
      .maybeSingle();
    if (error) throw error;
    return data as RecursoEducativo | null;
  },

  async deleteRecurso(id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from(RECURSOS_TABLE)
      .delete()
      .eq('id_recurso', id)
      .select('id_recurso')
      .maybeSingle();
    if (error) throw error;
    return data !== null;
  },
};