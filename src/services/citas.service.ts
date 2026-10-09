import type { CreateCitaDTO, ListCitasQueryDTO, UpdateEstadoCitaDTO } from '../dtos/citas.dto';
import { citasRepository } from '../repositories/citas.repository';
import { profesionalRepository } from '../repositories/profesional.repository';
import { AppError } from '../utils/AppError';
import { isForeignKeyViolation, isUniqueViolation } from '../utils/supabaseError';
import type { JwtPayload } from '../types';

async function obtenerPerfilProfesionalId(idUsuario: number): Promise<number> {
  const perfil = await profesionalRepository.findByIdUsuario(idUsuario);
  if (!perfil) throw AppError.forbidden('El usuario no tiene un perfil profesional asociado');
  return perfil.id_profesional;
}

export const citasService = {
  async crear(user: JwtPayload, dto: CreateCitaDTO) {
    if (user.nombre_rol !== 'beneficiario') {
      throw AppError.forbidden('Solo un beneficiario puede solicitar una cita');
    }

    const profesional = await profesionalRepository.findById(dto.id_profesional);
    if (!profesional) throw AppError.notFound('Profesional no encontrado');
    if (!profesional.disponibilidad || profesional.estado_cuenta !== 'activo') {
      throw AppError.conflict('El profesional no está disponible');
    }
    if (await citasRepository.tieneChoqueHorario(dto.id_profesional, dto.fecha_hora_programada)) {
      throw AppError.conflict('El profesional ya tiene una cita en ese horario');
    }

    try {
      return await citasRepository.create(user.id_usuario, dto);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw AppError.conflict('El profesional ya tiene una cita en ese horario');
      }
      if (isForeignKeyViolation(error)) {
        throw AppError.badRequest('El beneficiario o profesional indicado no existe');
      }
      throw error;
    }
  },

  async listar(user: JwtPayload, filtros: ListCitasQueryDTO) {
    let scope: { id_beneficiario?: number; id_profesional?: number } | undefined;
    if (user.nombre_rol === 'beneficiario') {
      scope = { id_beneficiario: user.id_usuario };
    } else if (user.nombre_rol === 'profesional') {
      scope = { id_profesional: await obtenerPerfilProfesionalId(user.id_usuario) };
    }

    const { rows, total } = await citasRepository.findAll(filtros, scope);
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

  async obtener(id: number, user: JwtPayload) {
    const cita = await citasRepository.findById(id);
    if (!cita) throw AppError.notFound('Cita no encontrada');

    if (user.nombre_rol === 'beneficiario' && cita.id_beneficiario !== user.id_usuario) {
      throw AppError.notFound('Cita no encontrada');
    }
    if (user.nombre_rol === 'profesional') {
      const idProfesional = await obtenerPerfilProfesionalId(user.id_usuario);
      if (cita.id_profesional !== idProfesional) throw AppError.notFound('Cita no encontrada');
    }
    return cita;
  },

  async actualizarEstado(id: number, dto: UpdateEstadoCitaDTO, user: JwtPayload) {
    const cita = await citasRepository.findById(id);
    if (!cita) throw AppError.notFound('Cita no encontrada');

    if (user.nombre_rol !== 'administrador') {
      if (user.nombre_rol !== 'profesional') {
        throw AppError.forbidden('Solo un profesional asignado o administrador puede actualizar la cita');
      }
      const idProfesional = await obtenerPerfilProfesionalId(user.id_usuario);
      if (cita.id_profesional !== idProfesional) {
        throw AppError.forbidden('Solo el profesional asignado puede actualizar esta cita');
      }
    }

    try {
      const actualizada = await citasRepository.updateEstado(id, dto);
      if (!actualizada) throw AppError.notFound('Cita no encontrada');
      return actualizada;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueViolation(error)) {
        throw AppError.conflict('El profesional ya tiene una cita en ese horario');
      }
      throw error;
    }
  },
};