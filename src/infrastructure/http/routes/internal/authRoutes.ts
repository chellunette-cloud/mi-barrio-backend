import { Router } from 'express';
import type { AuthControllerDependencies } from '../../controllers/authController.js';
import { createAuthController } from '../../controllers/authController.js';

export function createAuthRouter(deps: AuthControllerDependencies): Router {
  const router = Router();
  const controller = createAuthController(deps);
  router.post('/auth/login', controller.login);
  router.post('/auth/refresh', controller.refresh);
  return router;
}