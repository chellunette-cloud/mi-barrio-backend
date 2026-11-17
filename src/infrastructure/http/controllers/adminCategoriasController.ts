import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { CategoriaRepository } from '../../../domain/places/types.js';
import type { AdminRepository } from '../../../domain/auth/types.js';
import { CategoriaCodigoDuplicadoError } from '../../../domain/places/types.js';
import { HttpError } from '../../../lib/httpError.js';
import { invalidData } from './adminValidation.js';

export interface AdminCategoriasDependencies {
  categorias: CategoriaRepository;
  admin: AdminRepository;
}

const categoriaSchema = z.object({
  codigo: z.string().trim().min(2).max(40).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nombre: z.string().trim().min(1).max(120),
  descripcion: z.string().trim().min(1).max(300),
  activa: z.boolean().optional()
});

export function createAdminCategoriasController(deps: AdminCategoriasDependencies) {
  const usuario = (req: Request): string =>
    (req as Request & { admin?: { username: string } }).admin?.username ?? 'admin';

  return {
    list: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try { res.json(await deps.categorias.listCategoriasAdmin()); } catch (error) { next(error); }
    },
    create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const body = categoriaSchema.parse(req.body);
        const created = await deps.categorias.createCategoria(body);
        await deps.admin.audit({ usuario: usuario(req), accion: 'crear', entidad: 'categoria', entidadId: created.id, antes: null, despues: JSON.stringify(created) });
        res.status(201).json(created);
      } catch (error) {
        next(toHttpError(error));
      }
    },
    update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const id = identifier(req.params.id);
        const before = await deps.categorias.findCategoria(id);
        if (!before) throw new HttpError(404, 'CATEGORIA_NO_ENCONTRADA', 'La categoría no existe');
        const body = categoriaSchema.partial().parse(req.body);
        const updated = await deps.categorias.updateCategoria(id, body);
        await deps.admin.audit({ usuario: usuario(req), accion: 'editar', entidad: 'categoria', entidadId: id, antes: JSON.stringify(before), despues: JSON.stringify(updated) });
        res.json(updated);
      } catch (error) {
        next(toHttpError(error));
      }
    },
    remove: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const id = identifier(req.params.id);
        const target = optionalIdentifier(req.query.reasignarA);
        const before = await deps.categorias.findCategoria(id);
        if (!before) throw new HttpError(404, 'CATEGORIA_NO_ENCONTRADA', 'La categoría no existe');
        const result = await deps.categorias.deleteCategoria(id, target);
        if (result.status === 'has_places') {
          throw new HttpError(409, 'CATEGORIA_CON_LUGARES', `La categoría tiene ${result.lugares} lugares asociados; seleccione una categoría destino para reasignarlos`);
        }
        if (result.status === 'invalid_target') {
          throw new HttpError(400, 'CATEGORIA_DESTINO_INVALIDA', 'La categoría destino no existe, está inactiva o es la misma categoría');
        }
        await deps.admin.audit({ usuario: usuario(req), accion: 'eliminar', entidad: 'categoria', entidadId: id, antes: JSON.stringify(before), despues: JSON.stringify({ reasignarA: target ?? null, lugares: result.lugares }) });
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  };
}

function identifier(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID_INVALIDO', 'Identificador inválido');
  return id;
}

function optionalIdentifier(value: unknown): number | undefined {
  if (value === undefined || value === '') return undefined;
  return identifier(value);
}

function toHttpError(error: unknown): unknown {
  if (error instanceof z.ZodError) return invalidData(error);
  if (error instanceof CategoriaCodigoDuplicadoError) {
    return new HttpError(409, 'CATEGORIA_DUPLICADA', error.message);
  }
  return error;
}
