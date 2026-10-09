import { Router } from 'express';
import { diarioEmocionalController } from '../controllers/diario-emocional.controller';
import { createDiarioRegistroSchema, queryDiarioSchema } from '../dtos/diario-emocional.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate, authorize('beneficiario'));

router.post('/', validate(createDiarioRegistroSchema), diarioEmocionalController.crear);
router.get('/mi-historial', validate(queryDiarioSchema, 'query'), diarioEmocionalController.listarHistorial);
router.get('/:id', diarioEmocionalController.obtener);
router.delete('/:id', diarioEmocionalController.eliminar);

export default router;