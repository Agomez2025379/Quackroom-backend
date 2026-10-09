import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { authorizeSelfOrAdmin } from '../middlewares/authorizeSelfOrAdmin.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  listUsuariosQuerySchema,
  updateUserProfileSchema,
  updateUserStatusSchema,
} from '../dtos/usuario.dto';

const router = Router();

router.use(authenticate);

router.get('/', authorize('administrador'), validate(listUsuariosQuerySchema, 'query'), usuarioController.listar);
router.get('/:id', authorizeSelfOrAdmin, usuarioController.obtener);
router.put('/:id', authorizeSelfOrAdmin, validate(updateUserProfileSchema), usuarioController.actualizar);
router.patch('/:id/estado', authorize('administrador'), validate(updateUserStatusSchema), usuarioController.cambiarEstado);

export default router;
