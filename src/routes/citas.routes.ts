import { Router } from 'express';
import { citasController } from '../controllers/citas.controller';
import {
  createCitaSchema,
  listCitasQuerySchema,
  updateEstadoCitaSchema,
} from '../dtos/citas.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import resenasRoutes from './resenas.routes';

const router = Router();

router.use(authenticate);
router.post('/', authorize('beneficiario'), validate(createCitaSchema), citasController.crear);
router.get('/', validate(listCitasQuerySchema, 'query'), citasController.listar);
router.use('/:id/resena', resenasRoutes);
router.patch(
  '/:id/estado',
  authorize('administrador', 'profesional'),
  validate(updateEstadoCitaSchema),
  citasController.actualizarEstado,
);
router.get('/:id', citasController.obtener);

export default router;