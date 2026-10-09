import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authLoginSchema, authRegisterSchema } from '../dtos/auth.dto';

const router = Router();

router.post('/register', validate(authRegisterSchema), authController.register);
router.post('/login', validate(authLoginSchema), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
