import type { NextFunction, Request, Response } from 'express';
import { usuarioService } from '../services/usuario.service';
import { AppError } from '../utils/AppError';
import type { ListUsuariosQueryDTO, UpdateUserProfileDTO, UpdateUserStatusDTO } from '../dtos/usuario.dto';

function parseId(raw: string | string[] | undefined): number {
  const valor = Array.isArray(raw) ? raw[0] : raw ?? '';
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw AppError.badRequest('El identificador de usuario no es válido');
  }
  return id;
}

export const usuarioController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await usuarioService.listar(req.query as unknown as ListUsuariosQueryDTO);
      res.status(200).json({
        success: true,
        data: resultado.data,
        meta: resultado.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async obtener(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await usuarioService.obtener(parseId(req.params.id));
      res.status(200).json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await usuarioService.actualizarPerfil(
        parseId(req.params.id),
        req.body as UpdateUserProfileDTO,
      );
      res.status(200).json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { estado_cuenta } = req.body as UpdateUserStatusDTO;
      const usuario = await usuarioService.cambiarEstado(parseId(req.params.id), estado_cuenta);
      res.status(200).json({
        success: true,
        message: 'Estado de cuenta actualizado correctamente',
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  },
};
