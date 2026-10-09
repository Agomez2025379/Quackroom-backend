import { supabase } from '../config/supabase';
import type { RolRow } from '../types/database';

const TABLE = 'roles';
const COLUMNS = 'id_rol, nombre_rol, descripcion';

export const rolRepository = {
  async findAll(): Promise<RolRow[]> {
    const { data, error } = await supabase.from(TABLE).select(COLUMNS).order('id_rol', { ascending: true });
    if (error) {
      throw error;
    }
    return (data ?? []) as RolRow[];
  },

  async findById(id: number): Promise<RolRow | null> {
    const { data, error } = await supabase.from(TABLE).select(COLUMNS).eq('id_rol', id).maybeSingle();
    if (error) {
      throw error;
    }
    return (data as RolRow | null) ?? null;
  },

  async findByNombre(nombre: string): Promise<RolRow | null> {
    const { data, error } = await supabase.from(TABLE).select(COLUMNS).eq('nombre_rol', nombre).maybeSingle();
    if (error) {
      throw error;
    }
    return (data as RolRow | null) ?? null;
  },
};
