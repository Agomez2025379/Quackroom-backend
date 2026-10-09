import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import type { AuthLoginDTO, AuthRegisterDTO } from '../dtos/auth.dto';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await authService.register(req.body as AuthRegisterDTO);
      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente',
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await authService.login(req.body as AuthLoginDTO);
      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idUsuario = req.user?.id_usuario;
      if (!idUsuario) {
        throw AppError.unauthorized('No autenticado');
      }
      const usuario = await authService.me(idUsuario);
      res.status(200).json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  },
};
