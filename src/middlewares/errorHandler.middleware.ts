import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
  expose?: boolean;
}

function serializeZodError(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export const errorHandler: ErrorRequestHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { code: err.code });
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined ? { errors: err.details } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: serializeZodError(err),
    });
    return;
  }

  if (err.type === 'entity.too.large') {
    res.status(413).json({
      success: false,
      message: 'El cuerpo de la solicitud excede el tamaño permitido',
    });
    return;
  }

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    res.status(400).json({
      success: false,
      message: 'El cuerpo de la solicitud no es un JSON válido',
    });
    return;
  }

  logger.error('Error no controlado', { message: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
};
