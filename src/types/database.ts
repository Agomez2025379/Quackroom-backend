import type { EstadoCuenta, Rol } from './index';

export interface RolRow {
  id_rol: number;
  nombre_rol: string;
  descripcion: string | null;
}

export interface UsuarioRow {
  id_usuario: number;
  id_rol: number;
  nombre_completo: string;
  correo_electronico: string;
  contrasenia_hash: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  estado_cuenta: EstadoCuenta;
  fecha_registro: string;
}

export interface UsuarioConRol extends Omit<UsuarioRow, 'contrasenia_hash'> {
  nombre_rol: Rol;
}

export interface UsuarioConHash extends UsuarioRow {
  nombre_rol: Rol;
}
