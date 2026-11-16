import { Router } from 'express';
import { JwtService } from '../../../auth/JwtService.js';
import type { AdminLugaresDependencies } from '../../controllers/adminLugaresController.js';
import { createAdminLugaresController } from '../../controllers/adminLugaresController.js';
import { createAdminAuth } from '../../middleware/adminAuth.js';

export interface AdminRouterDependencies extends AdminLugaresDependencies {
  jwtSecret: string;
  jwtRefreshSecret: string;
}

export function createAdminRouter(deps: AdminRouterDependencies): Router {
  const router = Router();
  const jwt = new JwtService(deps.jwtSecret, deps.jwtRefreshSecret);
  const controller = createAdminLugaresController(deps);
  router.use(createAdminAuth(jwt));
  router.get('/admin/lugares', controller.list);
  router.post('/admin/lugares', controller.create);
  router.put('/admin/lugares/:id', controller.update);
  router.delete('/admin/lugares/:id', controller.remove);
  router.get('/admin/auditoria', controller.audit);
  return router;
}