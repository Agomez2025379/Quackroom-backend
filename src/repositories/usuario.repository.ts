import { supabase } from '../config/supabase';
import type { EstadoCuenta, Rol } from '../types';
import type { UsuarioConHash, UsuarioConRol } from '../types/database';

const TABLE = 'usuarios';
const RELACION_ROL = 'roles(nombre_rol)';
const PUBLIC_SELECT = `id_usuario, id_rol, nombre_completo, correo_electronico, telefono, fecha_nacimiento, estado_cuenta, fecha_registro, ${RELACION_ROL}`;
const AUTH_SELECT = `id_usuario, id_rol, nombre_completo, correo_electronico, contrasenia_hash, telefono, fecha_nacimiento, estado_cuenta, fecha_registro, ${RELACION_ROL}`;

interface RawUsuario {
  id_usuario: number;
  id_rol: number;
  nombre_completo: string;
  correo_electronico: string;
  contrasenia_hash?: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  estado_cuenta: EstadoCuenta;
  fecha_registro: string;
  roles: { nombre_rol: string } | { nombre_rol: string }[] | null;
}

export interface CreateUsuarioPayload {
  id_rol: number;
  nombre_completo: string;
  correo_electronico: string;
  contrasenia_hash: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
}

export interface UpdateUsuarioPayload {
  nombre_completo?: string;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
}

export interface ListUsuariosFilters {
  page: number;
  limit: number;
  id_rol?: number;
  estado_cuenta?: EstadoCuenta;
  search?: string;
}

function resolverRol(roles: RawUsuario['roles']): Rol {
  const relacion = Array.isArray(roles) ? roles[0] : roles;
  return (relacion?.nombre_rol ?? '') as Rol;
}

function mapPublic(row: RawUsuario): UsuarioConRol {
  return {
    id_usuario: row.id_usuario,
    id_rol: row.id_rol,
    nombre_rol: resolverRol(row.roles),
    nombre_completo: row.nombre_completo,
    correo_electronico: row.correo_electronico,
    telefono: row.telefono,
    fecha_nacimiento: row.fecha_nacimiento,
    estado_cuenta: row.estado_cuenta,
    fecha_registro: row.fecha_registro,
  };
}

function mapAuth(row: RawUsuario): UsuarioConHash {
  return {
    ...mapPublic(row),
    contrasenia_hash: row.contrasenia_hash ?? '',
  };
}

export const usuarioRepository = {
  async create(payload: CreateUsuarioPayload): Promise<UsuarioConRol> {
    const { data, error } = await supabase.from(TABLE).insert(payload).select(PUBLIC_SELECT).single();
    if (error) {
      throw error;
    }
    return mapPublic(data as RawUsuario);
  },

  async findByEmail(correo: string): Promise<UsuarioConHash | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(AUTH_SELECT)
      .eq('correo_electronico', correo)
      .maybeSingle();
    if (error) {
      throw error;
    }
    return data ? mapAuth(data as RawUsuario) : null;
  },

  async findById(id: number): Promise<UsuarioConRol | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(PUBLIC_SELECT)
      .eq('id_usuario', id)
      .maybeSingle();
    if (error) {
      throw error;
    }
    return data ? mapPublic(data as RawUsuario) : null;
  },

  async findAll(filters: ListUsuariosFilters): Promise<{ rows: UsuarioConRol[]; total: number }> {
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;

    let query = supabase
      .from(TABLE)
      .select(PUBLIC_SELECT, { count: 'exact' })
      .order('id_usuario', { ascending: true })
      .range(from, to);

    if (filters.id_rol !== undefined) {
      query = query.eq('id_rol', filters.id_rol);
    }
    if (filters.estado_cuenta !== undefined) {
      query = query.eq('estado_cuenta', filters.estado_cuenta);
    }
    if (filters.search) {
      query = query.ilike('nombre_completo', `%${filters.search}%`);
    }

    const { data, error, count } = await query;
    if (error) {
      throw error;
    }
    return { rows: (data ?? []).map((row) => mapPublic(row as RawUsuario)), total: count ?? 0 };
  },

  async updateProfile(id: number, payload: UpdateUsuarioPayload): Promise<UsuarioConRol | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id_usuario', id)
      .select(PUBLIC_SELECT)
      .maybeSingle();
    if (error) {
      throw error;
    }
    return data ? mapPublic(data as RawUsuario) : null;
  },

  async updateEstado(id: number, estado: EstadoCuenta): Promise<UsuarioConRol | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ estado_cuenta: estado })
      .eq('id_usuario', id)
      .select(PUBLIC_SELECT)
      .maybeSingle();
    if (error) {
      throw error;
    }
    return data ? mapPublic(data as RawUsuario) : null;
  },
};
