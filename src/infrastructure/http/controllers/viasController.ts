import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { ListVias } from '../../../application/vias/ListVias.js';
import { HttpError } from '../../../lib/httpError.js';

export interface ViasControllerDependencies {
  listVias: ListVias;
}

const querySchema = z.object({
  highway: z.string().trim().optional()
});

export function createViasController(deps: ViasControllerDependencies) {
  return {
    vias: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const query = querySchema.parse(req.query);
        res.json(await deps.listVias.execute(query.highway));
      } catch (error) {
        next(error instanceof z.ZodError ? new HttpError(400, 'FILTRO_INVALIDO', 'Filtro inválido') : error);
      }
    }
  };
}