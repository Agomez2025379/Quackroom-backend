import { supabase } from '../config/supabase';
import type { CreateResenaDTO } from '../dtos/resenas.dto';

const TABLE = 'resenas_atencion';
const SELECT_FIELDS = 'id_resena, id_cita, calificacion, comentario, fecha_resena';

export interface ResenaAtencion extends CreateResenaDTO {
  id_resena: number;
  id_cita: number;
  fecha_resena: string;
  comentario: string | null;
}

export const resenasRepository = {
  async findByCitaId(idCita: number): Promise<ResenaAtencion | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_FIELDS)
      .eq('id_cita', idCita)
      .maybeSingle();
    if (error) throw error;
    return data as ResenaAtencion | null;
  },

  async create(idCita: number, dto: CreateResenaDTO): Promise<ResenaAtencion> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ id_cita: idCita, ...dto })
      .select(SELECT_FIELDS)
      .single();
    if (error) throw error;
    return data as ResenaAtencion;
  },
};