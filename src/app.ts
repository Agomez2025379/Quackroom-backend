import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { AppError } from './utils/AppError';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Referrer-Policy': 'no-referrer',
  'X-DNS-Prefetch-Control': 'off',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

function applySecurityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.removeHeader('X-Powered-By');
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(name, value);
  }
  next();
}

export function buildApp(): Application {
  const app = express();

  app.disable('x-powered-by');
  app.use(applySecurityHeaders);
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'API QUACKROOM activa' });
  });

  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404, { code: 'NOT_FOUND' }));
  });

  app.use(errorHandler);

  return app;
}
