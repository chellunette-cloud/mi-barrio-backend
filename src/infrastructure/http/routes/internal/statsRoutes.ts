import { Router } from 'express';
import type { StatsControllerDependencies } from '../../controllers/statsController.js';
import { createStatsController } from '../../controllers/statsController.js';

export function createStatsRouter(deps: StatsControllerDependencies): Router {
  const router = Router();
  const controller = createStatsController(deps);
  router.get('/estadisticas/demografia', controller.demografia);
  router.get('/estadisticas/seguridad', controller.seguridad);
  return router;
}