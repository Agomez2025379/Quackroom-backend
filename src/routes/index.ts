import { Router } from 'express';
import authRoutes from './auth.routes';
import centrosAtencionRoutes from './centros-atencion.routes';
import { categoriasRoutes, recursosRoutes } from './recursos.routes';
import usuarioRoutes from './usuario.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/centros-atencion', centrosAtencionRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/recursos', recursosRoutes);

export default router;
