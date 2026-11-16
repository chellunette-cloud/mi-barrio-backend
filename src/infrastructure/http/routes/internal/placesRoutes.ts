import { Router } from 'express';
import type { PlacesControllerDependencies } from '../../controllers/placesController.js';
import { createPlacesController } from '../../controllers/placesController.js';

export function createPlacesRouter(deps: PlacesControllerDependencies): Router {
  const router = Router();
  const controller = createPlacesController(deps);
  router.get('/categorias', controller.categorias);
  router.get('/lugares', controller.lugares);
  router.get('/lugares/:id', controller.lugar);
  return router;
}