import { Router } from 'express';
import { resenasController } from '../controllers/resenas.controller';
import { createResenaSchema } from '../dtos/resenas.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router({ mergeParams: true });

router.post('/', authenticate, authorize('beneficiario'), validate(createResenaSchema), resenasController.crear);

export default router;