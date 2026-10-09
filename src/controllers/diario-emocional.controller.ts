import type { NextFunction, Request, Response } from 'express';
import type { CreateDiarioRegistroDTO, QueryDiarioDTO } from '../dtos/diario-emocional.dto';
import { diarioEmocionalService } from '../services/diario-emocional.service';
import { AppError } from '../utils/AppError';

function getAuthenticatedUserId(req: Request): number {
  if (!req.user) throw AppError.unauthorized('No autenticado');
  return req.user.id_usuario;
}

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw ?? '';
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw AppError.badRequest('El identificador del registro no es válido');
  }
  return id;
}

export const diarioEmocionalController = {
  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registro = await diarioEmocionalService.crear(
        getAuthenticatedUserId(req),
        req.body as CreateDiarioRegistroDTO,
      );
      res.status(201).json({ success: true, message: 'Registro emocional creado correctamente', data: registro });
    } catch (error) {
      next(error);
    }
  },

  async listarHistorial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await diarioEmocionalService.listarHistorial(
        getAuthenticatedUserId(req),
        req.query as unknown as QueryDiarioDTO,
      );
      res.status(200).json({ success: true, ...resultado });
    } catch (error) {
      next(error);
    }
  },

  async obtener(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registro = await diarioEmocionalService.obtener(
        parseId(req.params.id),
        getAuthenticatedUserId(req),
      );
      res.status(200).json({ success: true, data: registro });
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await diarioEmocionalService.eliminar(parseId(req.params.id), getAuthenticatedUserId(req));
      res.status(200).json({ success: true, message: 'Registro emocional eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  },
};