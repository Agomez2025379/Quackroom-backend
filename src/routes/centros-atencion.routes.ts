import { Router } from 'express';
import { centrosAtencionController } from '../controllers/centros-atencion.controller';
import {
  createCentroAtencionSchema,
  queryCentroSchema,
  updateCentroAtencionSchema,
} from '../dtos/centros-atencion.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.get('/', validate(queryCentroSchema, 'query'), centrosAtencionController.listar);
router.get('/:id', centrosAtencionController.obtener);
router.post(
  '/',
  authenticate,
  authorize('administrador'),
  validate(createCentroAtencionSchema),
  centrosAtencionController.crear,
);
router.put(
  '/:id',
  authenticate,
  authorize('administrador'),
  validate(updateCentroAtencionSchema),
  centrosAtencionController.actualizar,
);
router.delete('/:id', authenticate, authorize('administrador'), centrosAtencionController.eliminar);

export default router;