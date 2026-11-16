import { Router } from 'express';
import type { BarrioControllerDependencies } from '../../controllers/barrioController.js';
import { createBarrioController } from '../../controllers/barrioController.js';
import type { PlacesControllerDependencies } from '../../controllers/placesController.js';
import type { ListVias } from '../../../../application/vias/ListVias.js';
import { createPlacesRouter } from './placesRoutes.js';
import { createViasRouter } from './viasRoutes.js';
import { createStatsRouter } from './statsRoutes.js';
import type { AuthControllerDependencies } from '../../controllers/authController.js';
import { createAuthRouter } from './authRoutes.js';
import type { AdminRouterDependencies } from './adminRoutes.js';
import { createAdminRouter } from './adminRoutes.js';
import { requireServiceToken } from '../../middleware/serviceToken.js';

import type { StatsControllerDependencies } from '../../controllers/statsController.js';

export interface InternalRouterDependencies
  extends BarrioControllerDependencies,
    PlacesControllerDependencies,
    StatsControllerDependencies,
    AuthControllerDependencies,
    AdminRouterDependencies {
  serviceToken: string;
  listVias: ListVias;
}

export function createInternalRouter(deps: InternalRouterDependencies): Router {
  const router = Router();
  const controller = createBarrioController(deps);
  router.use(requireServiceToken(deps.serviceToken));
  router.get('/barrio', controller.barrio);
  router.get('/barrio/geometria', controller.geometria);
  router.use(createPlacesRouter(deps));
  router.use(createViasRouter(deps));
  router.use(createStatsRouter(deps));
  router.use(createAuthRouter(deps));
  router.use(createAdminRouter(deps));
  return router;
}