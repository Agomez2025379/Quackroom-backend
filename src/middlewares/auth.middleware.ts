import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import type { JwtPayload } from '../types';

const tokenPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['administrador', 'beneficiario', 'profesional']),
  nombre: z.string().optional(),
});

function extractBearerToken(header?: string): string | null {
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }
  return token.trim() || null;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    next(AppError.unauthorized('Token de acceso no proporcionado o con formato inválido'));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    const payload = tokenPayloadSchema.parse(decoded) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(AppError.unauthorized('Token inválido o expirado'));
  }
}
