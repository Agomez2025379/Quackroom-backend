import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { rolRepository } from '../repositories/rol.repository';
import { usuarioRepository } from '../repositories/usuario.repository';
import { AppError } from '../utils/AppError';
import { toPublicUser, type PublicUser } from '../utils/serializers';
import { isUniqueViolation } from '../utils/supabaseError';
import type { AuthLoginDTO, AuthRegisterDTO } from '../dtos/auth.dto';
import type { JwtPayload } from '../types';

const SALT_ROUNDS = 10;

export interface LoginResult {
  token: string;
  usuario: PublicUser;
}

function firmarToken(usuario: PublicUser): string {
  const payload: JwtPayload = {
    id_usuario: usuario.id_usuario,
    correo_electronico: usuario.correo_electronico,
    id_rol: usuario.id_rol,
    nombre_rol: usuario.nombre_rol,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export const authService = {
  async register(dto: AuthRegisterDTO): Promise<PublicUser> {
    const rol = await rolRepository.findById(dto.id_rol);
    if (!rol) {
      throw AppError.badRequest('El rol especificado no existe');
    }
    if (rol.nombre_rol === 'administrador') {
      throw AppError.forbidden('No es posible registrar usuarios con rol administrador');
    }

    const existente = await usuarioRepository.findByEmail(dto.correo_electronico);
    if (existente) {
      throw AppError.conflict('Ya existe una cuenta registrada con ese correo electrónico');
    }

    const contrasenia_hash = await bcrypt.hash(dto.contrasenia, SALT_ROUNDS);

    try {
      const creado = await usuarioRepository.create({
        id_rol: dto.id_rol,
        nombre_completo: dto.nombre_completo,
        correo_electronico: dto.correo_electronico,
        contrasenia_hash,
        telefono: dto.telefono ?? null,
        fecha_nacimiento: dto.fecha_nacimiento,
      });
      return toPublicUser(creado);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw AppError.conflict('Ya existe una cuenta registrada con ese correo electrónico');
      }
      throw error;
    }
  },

  async login(dto: AuthLoginDTO): Promise<LoginResult> {
    const usuario = await usuarioRepository.findByEmail(dto.correo_electronico);
    if (!usuario) {
      throw AppError.unauthorized('Credenciales incorrectas');
    }

    const contraseniaValida = await bcrypt.compare(dto.contrasenia, usuario.contrasenia_hash);
    if (!contraseniaValida) {
      throw AppError.unauthorized('Credenciales incorrectas');
    }

    if (usuario.estado_cuenta !== 'activo') {
      throw AppError.forbidden('La cuenta no se encuentra activa');
    }

    const publicUser = toPublicUser(usuario);
    return {
      token: firmarToken(publicUser),
      usuario: publicUser,
    };
  },

  async me(idUsuario: number): Promise<PublicUser> {
    const usuario = await usuarioRepository.findById(idUsuario);
    if (!usuario) {
      throw AppError.notFound('Usuario no encontrado');
    }
    return toPublicUser(usuario);
  },
};
