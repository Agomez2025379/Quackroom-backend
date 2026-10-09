import { usuarioRepository } from '../repositories/usuario.repository';
import { AppError } from '../utils/AppError';
import { toPublicUser, type PublicUser } from '../utils/serializers';
import { isForeignKeyViolation } from '../utils/supabaseError';
import type { ListUsuariosQueryDTO, UpdateUserProfileDTO } from '../dtos/usuario.dto';
import type { EstadoCuenta } from '../types';

export interface PaginatedUsuarios {
  data: PublicUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPaginas: number;
  };
}

export const usuarioService = {
  async listar(filtros: ListUsuariosQueryDTO): Promise<PaginatedUsuarios> {
    const { rows, total } = await usuarioRepository.findAll(filtros);
    return {
      data: rows.map(toPublicUser),
      meta: {
        total,
        page: filtros.page,
        limit: filtros.limit,
        totalPaginas: Math.ceil(total / filtros.limit),
      },
    };
  },

  async obtener(id: number): Promise<PublicUser> {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw AppError.notFound('Usuario no encontrado');
    }
    return toPublicUser(usuario);
  },

  async actualizarPerfil(id: number, dto: UpdateUserProfileDTO): Promise<PublicUser> {
    try {
      const actualizado = await usuarioRepository.updateProfile(id, dto);
      if (!actualizado) {
        throw AppError.notFound('Usuario no encontrado');
      }
      return toPublicUser(actualizado);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw AppError.badRequest('Los datos enviados no son válidos');
      }
      throw error;
    }
  },

  async cambiarEstado(id: number, estado: EstadoCuenta): Promise<PublicUser> {
    const actualizado = await usuarioRepository.updateEstado(id, estado);
    if (!actualizado) {
      throw AppError.notFound('Usuario no encontrado');
    }
    return toPublicUser(actualizado);
  },
};
