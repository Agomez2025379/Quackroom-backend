export type Rol = 'administrador' | 'beneficiario' | 'profesional';

export const ROLES: readonly Rol[] = ['administrador', 'beneficiario', 'profesional'];

export interface JwtPayload {
  sub: string;
  email: string;
  role: Rol;
  nombre?: string;
}
