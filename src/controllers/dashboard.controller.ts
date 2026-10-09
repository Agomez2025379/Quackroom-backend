import type { NextFunction, Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const dashboardController = {
  async obtenerEstadisticas(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.obtenerEstadisticas();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};