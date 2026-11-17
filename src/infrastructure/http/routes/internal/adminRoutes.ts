import { Router } from 'express';
import { JwtService } from '../../../auth/JwtService.js';
import type { AdminLugaresDependencies } from '../../controllers/adminLugaresController.js';
import { createAdminLugaresController } from '../../controllers/adminLugaresController.js';
import type { AdminCategoriasDependencies } from '../../controllers/adminCategoriasController.js';
import { createAdminCategoriasController } from '../../controllers/adminCategoriasController.js';
import { createAdminAuth } from '../../middleware/adminAuth.js';

export interface AdminRouterDependencies extends AdminLugaresDependencies, AdminCategoriasDependencies {
  jwtSecret: string;
  jwtRefreshSecret: string;
}

export function createAdminRouter(deps: AdminRouterDependencies): Router {
  const router = Router();
  const jwt = new JwtService(deps.jwtSecret, deps.jwtRefreshSecret);
  const lugares = createAdminLugaresController(deps);
  const categorias = createAdminCategoriasController(deps);
  router.use(createAdminAuth(jwt));
  router.get('/admin/lugares', lugares.list);
  router.post('/admin/lugares', lugares.create);
  router.put('/admin/lugares/:id', lugares.update);
  router.delete('/admin/lugares/:id', lugares.remove);
  router.get('/admin/categorias', categorias.list);
  router.post('/admin/categorias', categorias.create);
  router.put('/admin/categorias/:id', categorias.update);
  router.delete('/admin/categorias/:id', categorias.remove);
  router.get('/admin/auditoria', lugares.audit);
  return router;
}