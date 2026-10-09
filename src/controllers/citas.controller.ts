import type { NextFunction, Request, Response } from 'express';
import type { CreateCitaDTO, ListCitasQueryDTO, UpdateEstadoCitaDTO } from '../dtos/citas.dto';
import { citasService } from '../services/citas.service';
import { AppError } from '../utils/AppError';

function getUser(req: Request) {
  if (!req.user) throw AppError.unauthorized('No autenticado');
  return req.user;
}

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw ?? '';
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw AppError.badRequest('El identificador de cita no es válido');
  return id;
}

export const citasController = {
  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cita = await citasService.crear(getUser(req), req.body as CreateCitaDTO);
      res.status(201).json({ success: true, message: 'Cita solicitada correctamente', data: cita });
    } catch (error) {
      next(error);
    }
  },

  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await citasService.listar(
        getUser(req),
        req.query as unknown as ListCitasQueryDTO,
      );
      res.status(200).json({ success: true, ...resultado });
    } catch (error) {
      next(error);
    }
  },

  async obtener(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cita = await citasService.obtener(parseId(req.params.id), getUser(req));
      res.status(200).json({ success: true, data: cita });
    } catch (error) {
      next(error);
    }
  },

  async actualizarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cita = await citasService.actualizarEstado(
        parseId(req.params.id),
        req.body as UpdateEstadoCitaDTO,
        getUser(req),
      );
      res.status(200).json({ success: true, message: 'Cita actualizada correctamente', data: cita });
    } catch (error) {
      next(error);
    }
  },
};