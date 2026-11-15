import type { NextFunction, Request, Response } from 'express';
import type { GetBarrio } from '../../../application/barrio/GetBarrio.js';
import type { GetBarrioGeometria } from '../../../application/barrio/GetBarrioGeometria.js';
import { HttpError } from '../../../lib/httpError.js';

export interface BarrioControllerDependencies {
  getBarrio: GetBarrio;
  getBarrioGeometria: GetBarrioGeometria;
}

export function createBarrioController(deps: BarrioControllerDependencies) {
  return {
    barrio: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const data = await deps.getBarrio.execute();
        if (!data) throw new HttpError(404, 'BARRIO_NO_ENCONTRADO', 'El barrio no está cargado');
        res.json(data);
      } catch (error) {
        next(error);
      }
    },
    geometria: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const data = await deps.getBarrioGeometria.execute();
        if (!data) throw new HttpError(404, 'GEOMETRIA_NO_ENCONTRADA', 'La geometría no está cargada');
        res.json(data);
      } catch (error) {
        next(error);
      }
    }
  };
}
