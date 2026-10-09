import type {
  CreateCentroAtencionDTO,
  QueryCentroDTO,
  UpdateCentroAtencionDTO,
} from '../dtos/centros-atencion.dto';
import { centrosAtencionRepository } from '../repositories/centros-atencion.repository';
import { AppError } from '../utils/AppError';
import { isUniqueViolation } from '../utils/supabaseError';

export const centrosAtencionService = {
  async listar(filtros: QueryCentroDTO) {
    const { rows, total } = await centrosAtencionRepository.findAll(filtros);
    return {
      data: rows,
      pagination: {
        total,
        page: filtros.page,
        limit: filtros.limit,
        totalPages: Math.ceil(total / filtros.limit),
      },
    };
  },

  async obtener(id: number) {
    const centro = await centrosAtencionRepository.findById(id);
    if (!centro) throw AppError.notFound('Centro de atención no encontrado');
    return centro;
  },

  async crear(idCreador: number, dto: CreateCentroAtencionDTO) {
    try {
      return await centrosAtencionRepository.create({ ...dto, id_creador_usuario: idCreador });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw AppError.conflict('Ya existe un centro de atención con ese nombre');
      }
      throw error;
    }
  },

  async actualizar(id: number, dto: UpdateCentroAtencionDTO) {
    try {
      const centro = await centrosAtencionRepository.update(id, dto);
      if (!centro) throw AppError.notFound('Centro de atención no encontrado');
      return centro;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueViolation(error)) {
        throw AppError.conflict('Ya existe un centro de atención con ese nombre');
      }
      throw error;
    }
  },

  async eliminar(id: number): Promise<void> {
    if (!(await centrosAtencionRepository.delete(id))) {
      throw AppError.notFound('Centro de atención no encontrado');
    }
  },
};