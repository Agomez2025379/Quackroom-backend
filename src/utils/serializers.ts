import type { EstadoCuenta, Rol } from '../types';
import type { UsuarioConHash, UsuarioConRol } from '../types/database';

export interface PublicUser {
  id_usuario: number;
  id_rol: number;
  nombre_rol: Rol;
  nombre_completo: string;
  correo_electronico: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  estado_cuenta: EstadoCuenta;
  fecha_registro: string;
}

export function toPublicUser(usuario: UsuarioConRol | UsuarioConHash): PublicUser {
  return {
    id_usuario: usuario.id_usuario,
    id_rol: usuario.id_rol,
    nombre_rol: usuario.nombre_rol,
    nombre_completo: usuario.nombre_completo,
    correo_electronico: usuario.correo_electronico,
    telefono: usuario.telefono,
    fecha_nacimiento: usuario.fecha_nacimiento,
    estado_cuenta: usuario.estado_cuenta,
    fecha_registro: usuario.fecha_registro,
  };
}
