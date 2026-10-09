import { supabase } from '../config/supabase';
import type { CreateCitaDTO, ListCitasQueryDTO, UpdateEstadoCitaDTO } from '../dtos/citas.dto';

const TABLE = 'citas_orientacion';
const SELECT_FIELDS =
  'id_cita, id_beneficiario, id_profesional, fecha_hora_programada, enlace_reunion, estado_cita, notas_orientacion, fecha_creacion';

export interface CitaOrientacion {
  id_cita: number;
  id_beneficiario: number;
  id_profesional: number;
  fecha_hora_programada: string;
  enlace_reunion: string | null;
  estado_cita: 'solicitada' | 'confirmada' | 'atendida' | 'cancelada';
  notas_orientacion: string | null;
  fecha_creacion: string;
}

export const citasRepository = {
  async tieneChoqueHorario(idProfesional: number, fechaHora: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('id_cita')
      .eq('id_profesional', idProfesional)
      .eq('fecha_hora_programada', fechaHora)
      .neq('estado_cita', 'cancelada')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data !== null;
  },

  async create(
    idBeneficiario: number,
    dto: CreateCitaDTO,
  ): Promise<CitaOrientacion> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        id_beneficiario: idBeneficiario,
        id_profesional: dto.id_profesional,
        fecha_hora_programada: dto.fecha_hora_programada,
      })
      .select(SELECT_FIELDS)
      .single();
    if (error) throw error;
    return data as CitaOrientacion;
  },

  async findAll(
    filters: ListCitasQueryDTO,
    scope?: { id_beneficiario?: number; id_profesional?: number },
  ): Promise<{ rows: CitaOrientacion[]; total: number }> {
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    let query = supabase
      .from(TABLE)
      .select(SELECT_FIELDS, { count: 'exact' })
      .order('fecha_hora_programada', { ascending: false })
      .range(from, to);

    if (scope?.id_beneficiario !== undefined) {
      query = query.eq('id_beneficiario', scope.id_beneficiario);
    }
    if (scope?.id_profesional !== undefined) {
      query = query.eq('id_profesional', scope.id_profesional);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { rows: (data ?? []) as CitaOrientacion[], total: count ?? 0 };
  },

  async findById(id: number): Promise<CitaOrientacion | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_FIELDS)
      .eq('id_cita', id)
      .maybeSingle();
    if (error) throw error;
    return data as CitaOrientacion | null;
  },

  async updateEstado(id: number, dto: UpdateEstadoCitaDTO): Promise<CitaOrientacion | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(dto)
      .eq('id_cita', id)
      .select(SELECT_FIELDS)
      .maybeSingle();
    if (error) throw error;
    return data as CitaOrientacion | null;
  },
};