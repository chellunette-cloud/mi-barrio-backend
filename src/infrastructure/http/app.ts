import express, { type Express } from 'express';
import helmet from 'helmet';
import type { GetBarrio } from '../../application/barrio/GetBarrio.js';
import type { GetBarrioGeometria } from '../../application/barrio/GetBarrioGeometria.js';
import type { ListCategorias } from '../../application/places/ListCategorias.js';
import type { ListLugares } from '../../application/places/ListLugares.js';
import type { GetLugar } from '../../application/places/GetLugar.js';
import type { ListVias } from '../../application/vias/ListVias.js';
import type { GetDemografia } from '../../application/stats/GetDemografia.js';
import type { GetSeguridad } from '../../application/stats/GetSeguridad.js';
import type { LoginAdmin } from '../../application/auth/LoginAdmin.js';
import type { RefreshSession } from '../../application/auth/RefreshSession.js';
import type { AdminRepository } from '../../domain/auth/types.js';
import type { LugarRepository } from '../../domain/places/types.js';
import { createInternalRouter } from './routes/internal/barrioRoutes.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export interface AppDependencies {
  getBarrio: GetBarrio;
  getBarrioGeometria: GetBarrioGeometria;
  listCategorias: ListCategorias;
  listLugares: ListLugares;
  getLugar: GetLugar;
  listVias: ListVias;
  getDemografia: GetDemografia;
  getSeguridad: GetSeguridad;
  login: LoginAdmin;
  refresh: RefreshSession;
  lugares: LugarRepository;
  admin: AdminRepository;
  jwtSecret: string;
  jwtRefreshSecret: string;
  serviceToken: string;
}

export function createApp(deps: AppDependencies): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(requestId);
  app.use(express.json({ limit: '8kb' }));
  app.get('/internal/v1/health', (_req, res) => {
    res.json({ status: 'ok', service: 'mi-barrio-backend' });
  });
  app.use('/internal/v1', createInternalRouter(deps));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
