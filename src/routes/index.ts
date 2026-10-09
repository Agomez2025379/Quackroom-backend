import { Router } from 'express';
import authRoutes from './auth.routes';
import centrosAtencionRoutes from './centros-atencion.routes';
import citasRoutes from './citas.routes';
import dashboardRoutes from './dashboard.routes';
import diarioEmocionalRoutes from './diario-emocional.routes';
import { categoriasRoutes, recursosRoutes } from './recursos.routes';
import usuarioRoutes from './usuario.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/centros-atencion', centrosAtencionRoutes);
router.use('/citas', citasRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/diario-emocional', diarioEmocionalRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/recursos', recursosRoutes);

export default router;
