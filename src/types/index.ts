export type Rol = 'administrador' | 'beneficiario' | 'profesional';

export const ROLES: readonly Rol[] = ['administrador', 'beneficiario', 'profesional'];

export const ESTADOS_CUENTA = ['activo', 'inactivo', 'suspendido'] as const;
export type EstadoCuenta = (typeof ESTADOS_CUENTA)[number];

export interface JwtPayload {
  id_usuario: number;
  correo_electronico: string;
  id_rol: number;
  nombre_rol: Rol;
}
