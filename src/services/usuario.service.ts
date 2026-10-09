import bcrypt from 'bcrypt';
import { profesionalRepository } from '../repositories/profesional.repository';
import { rolRepository } from '../repositories/rol.repository';
import { usuarioRepository } from '../repositories/usuario.repository';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { isForeignKeyViolation, isUniqueViolation } from '../utils/supabaseError';
import { toPublicUser, type PublicUser } from '../utils/serializers';
import type {
  CreateAdminUserDTO,
  ListUsuariosQueryDTO,
  UpdateUserProfileDTO,
} from '../dtos/usuario.dto';
import type { EstadoCuenta } from '../types';

const SALT_ROUNDS = 10;

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
  async crearPorAdministrador(dto: CreateAdminUserDTO): Promise<PublicUser> {
    const rol = await rolRepository.findByNombre(dto.nombre_rol);
    if (!rol) throw AppError.badRequest('El rol especificado no existe');

    let perfilProfesional:
      | {
          numero_colegiado: string;
          especialidad: string;
          biografia: string | null;
          anios_experiencia: number;
        }
      | undefined;
    if (dto.nombre_rol === 'profesional') {
      if (
        !dto.numero_colegiado ||
        !dto.especialidad ||
        dto.anios_experiencia === undefined
      ) {
        throw AppError.badRequest('Faltan los datos obligatorios del perfil profesional');
      }
      perfilProfesional = {
        numero_colegiado: dto.numero_colegiado,
        especialidad: dto.especialidad,
        biografia: dto.biografia ?? null,
        anios_experiencia: dto.anios_experiencia,
      };
    }

    if (await usuarioRepository.findByEmail(dto.correo_electronico)) {
      throw AppError.conflict('Ya existe una cuenta registrada con ese correo electrónico');
    }

    let usuario: Awaited<ReturnType<typeof usuarioRepository.create>>;
    try {
      usuario = await usuarioRepository.create({
        id_rol: rol.id_rol,
        nombre_completo: dto.nombre_completo,
        correo_electronico: dto.correo_electronico,
        contrasenia_hash: await bcrypt.hash(dto.contrasenia, SALT_ROUNDS),
        telefono: dto.telefono ?? null,
        fecha_nacimiento: dto.fecha_nacimiento ?? null,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw AppError.conflict('Ya existe una cuenta registrada con ese correo electrónico');
      }
      throw error;
    }

    if (perfilProfesional) {
      try {
        await profesionalRepository.create({
          id_usuario: usuario.id_usuario,
          ...perfilProfesional,
        });
      } catch (error) {
        if (isUniqueViolation(error)) {
          try {
            await usuarioRepository.delete(usuario.id_usuario);
          } catch (cleanupError) {
            logger.error('No se pudo revertir la cuenta tras un error al crear el perfil profesional', {
              id_usuario: usuario.id_usuario,
              message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
            });
          }
          throw AppError.conflict('El número de colegiado ya está registrado');
        }
        try {
          await usuarioRepository.delete(usuario.id_usuario);
        } catch (cleanupError) {
          logger.error('No se pudo revertir la cuenta tras un error al crear el perfil profesional', {
            id_usuario: usuario.id_usuario,
            message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
          });
        }
        throw error;
      }
    }

    return toPublicUser(usuario);
  },

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
