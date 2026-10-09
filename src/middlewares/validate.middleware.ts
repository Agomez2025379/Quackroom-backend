import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError';

export type RequestSource = 'body' | 'query' | 'params' | 'headers';

export function validate(schema: ZodTypeAny, source: RequestSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      next(AppError.badRequest('Datos de entrada inválidos', errors));
      return;
    }

    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });

    next();
  };
}
