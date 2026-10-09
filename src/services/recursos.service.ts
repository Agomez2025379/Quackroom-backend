import {
  type CreateCategoriaDTO,
  type CreateRecursoDTO,
  type QueryParamsDTO,
  type UpdateCategoriaDTO,
  type UpdateRecursoDTO,
} from '../dtos/recursos.dto';
import { recursosRepository } from '../repositories/recursos.repository';
import { AppError } from '../utils/AppError';
import { isForeignKeyViolation, isUniqueViolation } from '../utils/supabaseError';
import type { Rol } from '../types';

export const recursosService = {
  listarCategorias: () => recursosRepository.findAllCategorias(),

  async crearCategoria(dto: CreateCategoriaDTO) {
    try {
      return await recursosRepository.createCategoria(dto);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw AppError.conflict('Ya existe una categoría con ese nombre');
      }
      throw error;
    }
  },

  async actualizarCategoria(id: number, dto: UpdateCategoriaDTO) {
    try {
      const categoria = await recursosRepository.updateCategoria(id, dto);
      if (!categoria) throw AppError.notFound('Categoría no encontrada');
      return categoria;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueViolation(error)) {
        throw AppError.conflict('Ya existe una categoría con ese nombre');
      }
      throw error;
    }
  },

  async eliminarCategoria(id: number): Promise<void> {
    try {
      if (!(await recursosRepository.deleteCategoria(id))) {
        throw AppError.notFound('Categoría no encontrada');
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isForeignKeyViolation(error)) {
        throw AppError.conflict('No se puede eliminar una categoría que tiene recursos asociados');
      }
      throw error;
    }
  },

  async listarRecursos(filtros: QueryParamsDTO) {
    const { rows, total } = await recursosRepository.findAllRecursos(filtros);
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

  async obtenerRecurso(id: number) {
    const recurso = await recursosRepository.findRecursoById(id);
    if (!recurso) throw AppError.notFound('Recurso educativo no encontrado');
    return recurso;
  },

  async crearRecurso(idAutor: number, dto: CreateRecursoDTO) {
    try {
      return await recursosRepository.createRecurso({ ...dto, id_autor_usuario: idAutor });
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw AppError.badRequest('La categoría o el usuario indicado no existe');
      }
      throw error;
    }
  },

  async actualizarRecurso(
    id: number,
    idUsuario: number,
    rol: Rol,
    dto: UpdateRecursoDTO,
  ) {
    const recurso = await recursosRepository.findRecursoById(id);
    if (!recurso) throw AppError.notFound('Recurso educativo no encontrado');
    if (rol !== 'administrador' && recurso.id_autor_usuario !== idUsuario) {
      throw AppError.forbidden('Solo el autor original o un administrador puede actualizar este recurso');
    }

    try {
      const actualizado = await recursosRepository.updateRecurso(id, dto);
      if (!actualizado) throw AppError.notFound('Recurso educativo no encontrado');
      return actualizado;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isForeignKeyViolation(error)) {
        throw AppError.badRequest('La categoría indicada no existe');
      }
      throw error;
    }
  },

  async eliminarRecurso(id: number): Promise<void> {
    if (!(await recursosRepository.deleteRecurso(id))) {
      throw AppError.notFound('Recurso educativo no encontrado');
    }
  },
};