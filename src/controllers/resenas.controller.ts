import type { NextFunction, Request, Response } from 'express';
import type { CreateResenaDTO } from '../dtos/resenas.dto';
import { resenasService } from '../services/resenas.service';
import { AppError } from '../utils/AppError';

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw ?? '';
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw AppError.badRequest('El identificador de cita no es válido');
  return id;
}

export const resenasController = {
  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized('No autenticado');
      const resena = await resenasService.crear(
        parseId(req.params.id),
        req.body as CreateResenaDTO,
        req.user,
      );
      res.status(201).json({ success: true, message: 'Reseña creada correctamente', data: resena });
    } catch (error) {
      next(error);
    }
  },
};