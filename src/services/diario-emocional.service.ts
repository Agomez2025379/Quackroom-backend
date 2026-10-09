import type { CreateDiarioRegistroDTO, QueryDiarioDTO } from '../dtos/diario-emocional.dto';
import { diarioEmocionalRepository } from '../repositories/diario-emocional.repository';
import { AppError } from '../utils/AppError';

export const diarioEmocionalService = {
  crear(idUsuario: number, dto: CreateDiarioRegistroDTO) {
    return diarioEmocionalRepository.create(idUsuario, dto);
  },

  async listarHistorial(idUsuario: number, filtros: QueryDiarioDTO) {
    const { rows, total } = await diarioEmocionalRepository.findAllByUser(idUsuario, filtros);
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

  async obtener(id: number, idUsuario: number) {
    const registro = await diarioEmocionalRepository.findById(id, idUsuario);
    if (!registro) throw AppError.notFound('Registro emocional no encontrado');
    return registro;
  },

  async eliminar(id: number, idUsuario: number): Promise<void> {
    if (!(await diarioEmocionalRepository.delete(id, idUsuario))) {
      throw AppError.notFound('Registro emocional no encontrado');
    }
  },
};