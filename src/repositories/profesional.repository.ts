import { supabase } from '../config/supabase';
import type { EstadoCuenta, Rol } from '../types';
import type { PerfilProfesionalRow, PerfilProfesionalConUsuario, RawPerfilProfesional } from '../types/profesional.types';

const TABLE = 'perfiles_profesionales';
const REL_USUARIO = 'usuarios(nombre_completo, correo_electronico, estado_cuenta, roles(nombre_rol))';
const SELECT_FULL = `id_profesional, id_usuario, numero_colegiado, especialidad, biografia, anios_experiencia, disponibilidad, ${REL_USUARIO}`;

function mapPerfil(row: RawPerfilProfesional): PerfilProfesionalConUsuario {
  const u = Array.isArray(row.usuarios) ? row.usuarios[0] : row.usuarios;
  const rawRoles = u?.roles;
  const relacion = Array.isArray(rawRoles) ? rawRoles[0] : rawRoles;
  return {
    id_profesional: row.id_profesional,
    id_usuario: row.id_usuario,
    numero_colegiado: row.numero_colegiado,
    especialidad: row.especialidad,
    biografia: row.biografia,
    anios_experiencia: row.anios_experiencia,
    disponibilidad: row.disponibilidad,
    nombre_completo: u?.nombre_completo ?? '',
    correo_electronico: u?.correo_electronico ?? '',
    estado_cuenta: (u?.estado_cuenta ?? 'inactivo') as EstadoCuenta,
    nombre_rol: (relacion?.nombre_rol ?? 'beneficiario') as Rol,
  };
}

export interface CreatePerfilPayload {
  id_usuario: number;
  numero_colegiado: string;
  especialidad: string;
  biografia: string | null;
  anios_experiencia: number;
}

export interface UpdatePerfilPayload {
  numero_colegiado?: string;
  especialidad?: string;
  biografia?: string | null;
  anios_experiencia?: number;
  disponibilidad?: boolean;
}

export interface ListFilters {
  disponible?: boolean;
  activo?: boolean;
  especialidad?: string;
  search?: string;
  page: number;
  limit: number;
}

export const profesionalRepository = {
  async create(payload: CreatePerfilPayload): Promise<PerfilProfesionalRow> {
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single();
    if (error) throw error;
    return data as PerfilProfesionalRow;
  },

  async findById(id: number): Promise<PerfilProfesionalConUsuario | null> {
    const { data, error } = await supabase.from(TABLE).select(SELECT_FULL).eq('id_profesional', id).maybeSingle();
    if (error) throw error;
    return data ? mapPerfil(data as RawPerfilProfesional) : null;
  },

  async findByIdUsuario(idUsuario: number): Promise<PerfilProfesionalRow | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id_usuario', idUsuario).maybeSingle();
    if (error) throw error;
    return data as PerfilProfesionalRow | null;
  },

  async findAll(filters: ListFilters): Promise<{ rows: PerfilProfesionalConUsuario[]; total: number }> {
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    let query = supabase.from(TABLE).select(SELECT_FULL, { count: 'exact' }).range(from, to).order('id_profesional', { ascending: true });

    if (filters.disponible !== undefined) {
      query = query.eq('disponibilidad', filters.disponible);
    }
    if (filters.activo !== undefined) {
      query = query.eq('usuarios.estado_cuenta', filters.activo ? 'activo' : 'inactivo');
    }
    if (filters.especialidad) {
      query = query.ilike('especialidad', `%${filters.especialidad}%`);
    }
    if (filters.search) {
      query = query.or(`usuarios.nombre_completo.ilike.%${filters.search}%,numero_colegiado.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { rows: (data ?? []).map((r) => mapPerfil(r as RawPerfilProfesional)), total: count ?? 0 };
  },

  async update(id: number, payload: UpdatePerfilPayload): Promise<PerfilProfesionalConUsuario | null> {
    const { data, error } = await supabase.from(TABLE).update(payload).eq('id_profesional', id).select(SELECT_FULL).maybeSingle();
    if (error) throw error;
    return data ? mapPerfil(data as RawPerfilProfesional) : null;
  },

  async updateDisponibilidad(id: number, disponibilidad: boolean): Promise<PerfilProfesionalRow | null> {
    const { data, error } = await supabase.from(TABLE).update({ disponibilidad }).eq('id_profesional', id).select('*').maybeSingle();
    if (error) throw error;
    return data as PerfilProfesionalRow | null;
  },
};
