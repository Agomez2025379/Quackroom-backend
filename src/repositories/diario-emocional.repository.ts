import { supabase } from '../config/supabase';
import type { CreateDiarioRegistroDTO, QueryDiarioDTO } from '../dtos/diario-emocional.dto';

const TABLE = 'diario_emocional';
const SELECT_FIELDS =
  'id_registro_emocional, id_usuario, nivel_animo, emocion_principal, notas_personales, fecha_registro';

export interface DiarioRegistro extends CreateDiarioRegistroDTO {
  id_registro_emocional: number;
  id_usuario: number;
  fecha_registro: string;
  notas_personales: string | null;
}

function fechaLimite(fecha: string, esFin: boolean): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return `${fecha}T${esFin ? '23:59:59.999' : '00:00:00.000'}Z`;
  }
  return fecha;
}

export const diarioEmocionalRepository = {
  async create(idUsuario: number, payload: CreateDiarioRegistroDTO): Promise<DiarioRegistro> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...payload, id_usuario: idUsuario })
      .select(SELECT_FIELDS)
      .single();
    if (error) throw error;
    return data as DiarioRegistro;
  },

  async findAllByUser(
    idUsuario: number,
    filters: QueryDiarioDTO,
  ): Promise<{ rows: DiarioRegistro[]; total: number }> {
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    let query = supabase
      .from(TABLE)
      .select(SELECT_FIELDS, { count: 'exact' })
      .eq('id_usuario', idUsuario)
      .order('fecha_registro', { ascending: false })
      .range(from, to);

    if (filters.fecha_inicio) {
      query = query.gte('fecha_registro', fechaLimite(filters.fecha_inicio, false));
    }
    if (filters.fecha_fin) {
      query = query.lte('fecha_registro', fechaLimite(filters.fecha_fin, true));
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { rows: (data ?? []) as DiarioRegistro[], total: count ?? 0 };
  },

  async findById(id: number, idUsuario: number): Promise<DiarioRegistro | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_FIELDS)
      .eq('id_registro_emocional', id)
      .eq('id_usuario', idUsuario)
      .maybeSingle();
    if (error) throw error;
    return data as DiarioRegistro | null;
  },

  async delete(id: number, idUsuario: number): Promise<boolean> {
    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id_registro_emocional', id)
      .eq('id_usuario', idUsuario)
      .select('id_registro_emocional')
      .maybeSingle();
    if (error) throw error;
    return data !== null;
  },
};