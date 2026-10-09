import type { EstadoCuenta, Rol } from './index';

export interface PerfilProfesionalRow {
  id_profesional: number;
  id_usuario: number;
  numero_colegiado: string;
  especialidad: string;
  biografia: string | null;
  anios_experiencia: number;
  disponibilidad: boolean;
}

export interface PerfilProfesionalConUsuario extends PerfilProfesionalRow {
  nombre_completo: string;
  correo_electronico: string;
  estado_cuenta: EstadoCuenta;
  nombre_rol: Rol;
}

export interface RawPerfilProfesional {
  id_profesional: number;
  id_usuario: number;
  numero_colegiado: string;
  especialidad: string;
  biografia: string | null;
  anios_experiencia: number;
  disponibilidad: boolean;
  usuarios: {
    nombre_completo: string;
    correo_electronico: string;
    estado_cuenta: EstadoCuenta;
    roles: { nombre_rol: string } | { nombre_rol: string }[] | null;
  } | {
    nombre_completo: string;
    correo_electronico: string;
    estado_cuenta: EstadoCuenta;
    roles: { nombre_rol: string } | { nombre_rol: string }[] | null;
  }[] | null;
}
