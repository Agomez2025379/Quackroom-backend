import { supabase } from '../config/supabase';
import type {
  CreateCentroAtencionDTO,
  QueryCentroDTO,
  UpdateCentroAtencionDTO,
} from '../dtos/centros-atencion.dto';

const TABLE = 'centros_atencion';
const SELECT_FIELDS =
  'id_centro, id_creador_usuario, nombre_centro, direccion, telefono, servicios_ofrecidos';

export interface CentroAtencion extends CreateCentroAtencionDTO {
  id_centro: number;
  id_creador_usuario: number;
}

export const centrosAtencionRepository = {
  async findAll(filters: QueryCentroDTO): Promise<{ rows: CentroAtencion[]; total: number }> {
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    let query = supabase
      .from(TABLE)
      .select(SELECT_FIELDS, { count: 'exact' })
      .order(filters.sortBy, { ascending: filters.order === 'asc' })
      .range(from, to);

    if (filters.search) {
      const term = filters.search.replace(/[\\,()]/g, '\\$&');
      query = query.or(`nombre_centro.ilike.%${term}%,servicios_ofrecidos.ilike.%${term}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { rows: (data ?? []) as CentroAtencion[], total: count ?? 0 };
  },

  async findById(id: number): Promise<CentroAtencion | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_FIELDS)
      .eq('id_centro', id)
      .maybeSingle();
    if (error) throw error;
    return data as CentroAtencion | null;
  },

  async create(
    payload: CreateCentroAtencionDTO & { id_creador_usuario: number },
  ): Promise<CentroAtencion> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select(SELECT_FIELDS)
      .single();
    if (error) throw error;
    return data as CentroAtencion;
  },

  async update(id: number, payload: UpdateCentroAtencionDTO): Promise<CentroAtencion | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id_centro', id)
      .select(SELECT_FIELDS)
      .maybeSingle();
    if (error) throw error;
    return data as CentroAtencion | null;
  },

  async delete(id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id_centro', id)
      .select('id_centro')
      .maybeSingle();
    if (error) throw error;
    return data !== null;
  },
};