import { Router } from 'express';
import {
  createCategoriaSchema,
  createRecursoSchema,
  queryParamsSchema,
  updateCategoriaSchema,
  updateRecursoSchema,
} from '../dtos/recursos.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { recursosController } from '../controllers/recursos.controller';

export const categoriasRoutes = Router();
export const recursosRoutes = Router();

categoriasRoutes.get('/', recursosController.listarCategorias);
categoriasRoutes.post(
  '/',
  authenticate,
  authorize('administrador'),
  validate(createCategoriaSchema),
  recursosController.crearCategoria,
);
categoriasRoutes.put(
  '/:id',
  authenticate,
  authorize('administrador'),
  validate(updateCategoriaSchema),
  recursosController.actualizarCategoria,
);
categoriasRoutes.delete('/:id', authenticate, authorize('administrador'), recursosController.eliminarCategoria);

recursosRoutes.get('/', validate(queryParamsSchema, 'query'), recursosController.listarRecursos);
recursosRoutes.get('/:id', recursosController.obtenerRecurso);
recursosRoutes.post(
  '/',
  authenticate,
  authorize('administrador', 'profesional'),
  validate(createRecursoSchema),
  recursosController.crearRecurso,
);
recursosRoutes.put('/:id', authenticate, validate(updateRecursoSchema), recursosController.actualizarRecurso);
recursosRoutes.delete('/:id', authenticate, authorize('administrador'), recursosController.eliminarRecurso);