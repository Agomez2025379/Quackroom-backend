import type { NextFunction, Request, Response } from 'express';
import type {
  CreateCategoriaDTO,
  CreateRecursoDTO,
  QueryParamsDTO,
  UpdateCategoriaDTO,
  UpdateRecursoDTO,
} from '../dtos/recursos.dto';
import { recursosService } from '../services/recursos.service';
import { AppError } from '../utils/AppError';

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw ?? '';
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw AppError.badRequest('El identificador no es válido');
  }
  return id;
}

export const recursosController = {
  async listarCategorias(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await recursosService.listarCategorias() });
    } catch (error) {
      next(error);
    }
  },

  async crearCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoria = await recursosService.crearCategoria(req.body as CreateCategoriaDTO);
      res.status(201).json({ success: true, message: 'Categoría creada correctamente', data: categoria });
    } catch (error) {
      next(error);
    }
  },

  async actualizarCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoria = await recursosService.actualizarCategoria(
        parseId(req.params.id),
        req.body as UpdateCategoriaDTO,
      );
      res.status(200).json({ success: true, message: 'Categoría actualizada correctamente', data: categoria });
    } catch (error) {
      next(error);
    }
  },

  async eliminarCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await recursosService.eliminarCategoria(parseId(req.params.id));
      res.status(200).json({ success: true, message: 'Categoría eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  },

  async listarRecursos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await recursosService.listarRecursos(req.query as unknown as QueryParamsDTO);
      res.status(200).json({ success: true, ...resultado });
    } catch (error) {
      next(error);
    }
  },

  async obtenerRecurso(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recurso = await recursosService.obtenerRecurso(parseId(req.params.id));
      res.status(200).json({ success: true, data: recurso });
    } catch (error) {
      next(error);
    }
  },

  async crearRecurso(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized('No autenticado');
      const recurso = await recursosService.crearRecurso(
        req.user.id_usuario,
        req.body as CreateRecursoDTO,
      );
      res.status(201).json({ success: true, message: 'Recurso creado correctamente', data: recurso });
    } catch (error) {
      next(error);
    }
  },

  async actualizarRecurso(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized('No autenticado');
      const recurso = await recursosService.actualizarRecurso(
        parseId(req.params.id),
        req.user.id_usuario,
        req.user.nombre_rol,
        req.body as UpdateRecursoDTO,
      );
      res.status(200).json({ success: true, message: 'Recurso actualizado correctamente', data: recurso });
    } catch (error) {
      next(error);
    }
  },

  async eliminarRecurso(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await recursosService.eliminarRecurso(parseId(req.params.id));
      res.status(200).json({ success: true, message: 'Recurso eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  },
};