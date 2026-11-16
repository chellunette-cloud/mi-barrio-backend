import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { ListCategorias } from '../../../application/places/ListCategorias.js';
import type { ListLugares } from '../../../application/places/ListLugares.js';
import type { GetLugar } from '../../../application/places/GetLugar.js';
import { HttpError } from '../../../lib/httpError.js';

export interface PlacesControllerDependencies {
  listCategorias: ListCategorias;
  listLugares: ListLugares;
  getLugar: GetLugar;
}

const filtroSchema = z.object({
  categoria: z.string().trim().optional(),
  q: z.string().trim().optional(),
  limite: z.coerce.number().int().min(1).max(1000).optional()
});

export function createPlacesController(deps: PlacesControllerDependencies) {
  return {
    categorias: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        res.json(await deps.listCategorias.execute());
      } catch (error) {
        next(error);
      }
    },
    lugares: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const filtro = filtroSchema.parse(req.query);
        res.json(await deps.listLugares.execute(filtro));
      } catch (error) {
        next(error instanceof z.ZodError ? new HttpError(400, 'FILTRO_INVALIDO', 'Filtro inválido') : error);
      }
    },
    lugar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID_INVALIDO', 'Identificador inválido');
        const data = await deps.getLugar.execute(id);
        if (!data) throw new HttpError(404, 'LUGAR_NO_ENCONTRADO', 'El lugar no existe');
        res.json(data);
      } catch (error) {
        next(error);
      }
    }
  };
}