import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { ROLES, type Rol } from '../types';

export function authorize(...allowedRoles: Rol[]) {
  const roles = allowedRoles.length > 0 ? allowedRoles : ROLES;

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized('No autenticado'));
      return;
    }

    if (!roles.includes(req.user.nombre_rol)) {
      next(AppError.forbidden('No tiene permisos para realizar esta acción'));
      return;
    }

    next();
  };
}
