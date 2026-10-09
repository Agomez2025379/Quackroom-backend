import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export function authorizeSelfOrAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(AppError.unauthorized('No autenticado'));
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    next(AppError.badRequest('El identificador de usuario no es válido'));
    return;
  }

  if (req.user.nombre_rol === 'administrador' || req.user.id_usuario === id) {
    next();
    return;
  }

  next(AppError.forbidden('Solo puede acceder a su propio perfil'));
}
