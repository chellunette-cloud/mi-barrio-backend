import { Router } from 'express';
import type { BarrioControllerDependencies } from '../../controllers/barrioController.js';
import { createBarrioController } from '../../controllers/barrioController.js';
import type { PlacesControllerDependencies } from '../../controllers/placesController.js';
import { createPlacesRouter } from './placesRoutes.js';
import { requireServiceToken } from '../../middleware/serviceToken.js';

export interface InternalRouterDependencies
  extends BarrioControllerDependencies, PlacesControllerDependencies {
  serviceToken: string;
}

export function createInternalRouter(deps: InternalRouterDependencies): Router {
  const router = Router();
  const controller = createBarrioController(deps);
  router.use(requireServiceToken(deps.serviceToken));
  router.get('/barrio', controller.barrio);
  router.get('/barrio/geometria', controller.geometria);
  router.use(createPlacesRouter(deps));
  return router;
}