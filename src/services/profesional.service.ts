import { profesionalRepository } from '../repositories/profesional.repository';
import { usuarioRepository } from '../repositories/usuario.repository';
import { AppError } from '../utils/AppError';
import { isUniqueViolation } from '../utils/supabaseError';
import type { CreatePerfilProfesionalDTO, ListProfesionalesQueryDTO, UpdatePerfilProfesionalDTO, UpdateDisponibilidadDTO } from '../dtos/profesional.dto';
import type { PerfilProfesionalConUsuario, PerfilProfesionalRow } from '../types/profesional.types';
import type { JwtPayload } from '../types';

function sanitizePerfil(p: PerfilProfesionalConUsuario): PerfilProfesionalConUsuario {
  return p;
}

export const profesionalService = {
  async crear(dto: CreatePerfilProfesionalDTO, user: JwtPayload): Promise<PerfilProfesionalConUsuario> {
    const idUsuario = dto.id_usuario ?? user.id_usuario;

    if (user.nombre_rol !== 'administrador' && idUsuario !== user.id_usuario) {
      throw AppError.forbidden('Solo puede crear su propio perfil profesional');
    }

    const usuario = await usuarioRepository.findById(idUsuario);
    if (!usuario) throw AppError.badRequest('El usuario especificado no existe');
    if (usuario.nombre_rol !== 'profesional') {
      throw AppError.badRequest('Solo los usuarios con rol profesional pueden tener un perfil profesional');
    }
    if (usuario.estado_cuenta !== 'activo') {
      throw AppError.forbidden('La cuenta del usuario debe estar activa');
    }

    const existente = await profesionalRepository.findByIdUsuario(idUsuario);
    if (existente) throw AppError.conflict('El usuario ya tiene un perfil profesional registrado');

    try {
      await profesionalRepository.create({
        id_usuario: idUsuario,
        numero_colegiado: dto.numero_colegiado,
        especialidad: dto.especialidad,
        biografia: dto.biografia ?? null,
        anios_experiencia: dto.anios_experiencia,
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw AppError.conflict('El número de colegiado ya está registrado');
      throw error;
    }

    const perfil = await profesionalRepository.findByIdUsuario(idUsuario);
    if (!perfil) throw AppError.notFound('No se pudo recuperar el perfil profesional creado');
    const detalle = await profesionalRepository.findById(perfil.id_profesional);
    if (!detalle) throw AppError.notFound('No se pudo recuperar el perfil profesional creado');
    return sanitizePerfil(detalle);
  },

  async listar(filters: ListProfesionalesQueryDTO): Promise<{ data: PerfilProfesionalConUsuario[]; meta: { total: number; page: number; limit: number; totalPaginas: number } }> {
    const f = { ...filters };
    if (f.disponible === undefined) f.disponible = true;
    if (f.activo === undefined) f.activo = true;
    const { rows, total } = await profesionalRepository.findAll(f);
    return {
      data: rows.map(sanitizePerfil),
      meta: { total, page: f.page, limit: f.limit, totalPaginas: Math.ceil(total / f.limit) },
    };
  },

  async obtener(id: number): Promise<PerfilProfesionalConUsuario> {
    const perfil = await profesionalRepository.findById(id);
    if (!perfil) throw AppError.notFound('Perfil profesional no encontrado');
    return sanitizePerfil(perfil);
  },

  async actualizar(id: number, dto: UpdatePerfilProfesionalDTO, user: JwtPayload): Promise<PerfilProfesionalConUsuario> {
    const perfil = await profesionalRepository.findById(id);
    if (!perfil) throw AppError.notFound('Perfil profesional no encontrado');

    if (user.nombre_rol !== 'administrador' && perfil.id_usuario !== user.id_usuario) {
      throw AppError.forbidden('Solo puede actualizar su propio perfil profesional');
    }

    try {
      const actualizado = await profesionalRepository.update(id, dto);
      if (!actualizado) throw AppError.notFound('Perfil profesional no encontrado');
      return sanitizePerfil(actualizado);
    } catch (error) {
      if (isUniqueViolation(error)) throw AppError.conflict('El número de colegiado ya está registrado');
      throw error;
    }
  },

  async cambiarDisponibilidad(id: number, dto: UpdateDisponibilidadDTO, user: JwtPayload): Promise<PerfilProfesionalRow> {
    const perfil = await profesionalRepository.findById(id);
    if (!perfil) throw AppError.notFound('Perfil profesional no encontrado');

    if (perfil.id_usuario !== user.id_usuario) {
      throw AppError.forbidden('Solo puede cambiar la disponibilidad de su propio perfil profesional');
    }
    if (user.nombre_rol !== 'profesional') {
      throw AppError.forbidden('Solo el usuario profesional puede cambiar su disponibilidad');
    }

    const actualizado = await profesionalRepository.updateDisponibilidad(id, dto.disponibilidad);
    if (!actualizado) throw AppError.notFound('Perfil profesional no encontrado');
    return actualizado;
  },
};
