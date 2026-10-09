import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/stats', authenticate, authorize('administrador'), dashboardController.obtenerEstadisticas);

export default router;