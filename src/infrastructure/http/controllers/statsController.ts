import type { NextFunction, Request, Response } from 'express';
import type { GetDemografia } from '../../../application/stats/GetDemografia.js';
import type { GetSeguridad } from '../../../application/stats/GetSeguridad.js';

export interface StatsControllerDependencies {
  getDemografia: GetDemografia;
  getSeguridad: GetSeguridad;
}

export function createStatsController(deps: StatsControllerDependencies) {
  return {
    demografia: (_req: Request, res: Response, next: NextFunction): void => {
      try { res.json(deps.getDemografia.execute()); } catch (error) { next(error); }
    },
    seguridad: (_req: Request, res: Response, next: NextFunction): void => {
      try { res.json(deps.getSeguridad.execute()); } catch (error) { next(error); }
    }
  };
}