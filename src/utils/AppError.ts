export interface AppErrorOptions {
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options.code;
    this.details = options.details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Solicitud inválida', details?: unknown): AppError {
    return new AppError(message, 400, { code: 'BAD_REQUEST', details });
  }

  static unauthorized(message = 'No autenticado'): AppError {
    return new AppError(message, 401, { code: 'UNAUTHORIZED' });
  }

  static forbidden(message = 'No tiene permisos para realizar esta acción'): AppError {
    return new AppError(message, 403, { code: 'FORBIDDEN' });
  }

  static notFound(message = 'Recurso no encontrado'): AppError {
    return new AppError(message, 404, { code: 'NOT_FOUND' });
  }

  static conflict(message = 'Conflicto con el estado actual del recurso'): AppError {
    return new AppError(message, 409, { code: 'CONFLICT' });
  }
}
