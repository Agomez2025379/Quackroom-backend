import type { NextFunction, Request, Response } from 'express';
import type {
  CreateCentroAtencionDTO,
  QueryCentroDTO,
  UpdateCentroAtencionDTO,
} from '../dtos/centros-atencion.dto';
import { centrosAtencionService } from '../services/centros-atencion.service';
import { AppError } from '../utils/AppError';

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw ?? '';
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw AppError.badRequest('El identificador de centro no es válido');
  }
  return id;
}

export const centrosAtencionController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await centrosAtencionService.listar(req.query as unknown as QueryCentroDTO);
      res.status(200).json({ success: true, ...resultado });
    } catch (error) {
      next(error);
    }
  },

  async obtener(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const centro = await centrosAtencionService.obtener(parseId(req.params.id));
      res.status(200).json({ success: true, data: centro });
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized('No autenticado');
      const centro = await centrosAtencionService.crear(
        req.user.id_usuario,
        req.body as CreateCentroAtencionDTO,
      );
      res.status(201).json({ success: true, message: 'Centro de atención creado correctamente', data: centro });
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const centro = await centrosAtencionService.actualizar(
        parseId(req.params.id),
        req.body as UpdateCentroAtencionDTO,
      );
      res.status(200).json({ success: true, message: 'Centro de atención actualizado correctamente', data: centro });
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await centrosAtencionService.eliminar(parseId(req.params.id));
      res.status(200).json({ success: true, message: 'Centro de atención eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  },
};