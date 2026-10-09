import type { CreateResenaDTO } from '../dtos/resenas.dto';
import { citasRepository } from '../repositories/citas.repository';
import { resenasRepository } from '../repositories/resenas.repository';
import { AppError } from '../utils/AppError';
import { isUniqueViolation } from '../utils/supabaseError';
import type { JwtPayload } from '../types';

export const resenasService = {
  async crear(idCita: number, dto: CreateResenaDTO, user: JwtPayload) {
    if (user.nombre_rol !== 'beneficiario') {
      throw AppError.forbidden('Solo un beneficiario puede crear una reseña');
    }

    const cita = await citasRepository.findById(idCita);
    if (!cita || cita.id_beneficiario !== user.id_usuario) {
      throw AppError.notFound('Cita no encontrada');
    }
    if (cita.estado_cita !== 'atendida') {
      throw AppError.conflict('Solo se puede reseñar una cita atendida');
    }
    if (await resenasRepository.findByCitaId(idCita)) {
      throw AppError.conflict('La cita ya tiene una reseña');
    }

    try {
      return await resenasRepository.create(idCita, dto);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw AppError.conflict('La cita ya tiene una reseña');
      }
      throw error;
    }
  },
};