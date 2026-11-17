import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { LugarRepository } from '../../../domain/places/types.js';
import type { AdminRepository } from '../../../domain/auth/types.js';
import { HttpError } from '../../../lib/httpError.js';
import { dentroArea, invalidData } from './adminValidation.js';
export interface AdminLugaresDependencies { lugares: LugarRepository; admin: AdminRepository; }
const placeSchema = z.object({
  categoriaId: z.number().int().positive(),
  nombre: z.string().trim().min(1).max(160),
  descripcion: z.string().trim().max(500).nullable().optional(),
  direccion: z.string().trim().max(200).nullable().optional(),
  sector: z.string().trim().max(40).nullable().optional(),
  tipo: z.string().trim().max(60).nullable().optional(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  publicado: z.boolean().optional()
});

export function createAdminLugaresController(deps: AdminLugaresDependencies) {
  const adminName = (req: Request): string =>
    (req as Request & { admin?: { username: string } }).admin?.username ?? 'admin';

  return {
    list: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try { res.json(await deps.lugares.listLugaresAdmin()); } catch (error) { next(error); }
    },
    create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const body = placeSchema.parse(req.body);
        if (!dentroArea(body.lat, body.lon)) {
          throw new HttpError(400, 'COORDENADAS_FUERA_AREA', 'Coordenadas fuera del área de influencia de Ciudad Granada');
        }
        const input = {
          categoriaCodigo: await categoriaCodigo(deps.lugares, body.categoriaId),
          nombre: body.nombre,
          descripcion: body.descripcion ?? null,
          direccion: body.direccion ?? null,
          sector: body.sector ?? null,
          tipo: body.tipo ?? null,
          codigo: null,
          lat: body.lat,
          lon: body.lon,
          publicado: body.publicado ?? true,
          fuentePrincipal: 'admin'
        };
        const created = await deps.lugares.createLugar(input);
        await deps.admin.audit({ usuario: adminName(req), accion: 'crear', entidad: 'lugar', entidadId: created.id, antes: null, despues: JSON.stringify(created) });
        res.status(201).json(created);
      } catch (error) {
        next(error instanceof z.ZodError ? invalidData(error) : error);
      }
    },
    update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID_INVALIDO', 'Identificador inválido');
        const before = await deps.lugares.findLugarAdmin(id);
        if (!before) throw new HttpError(404, 'LUGAR_NO_ENCONTRADO', 'El lugar no existe');
        const body = placeSchema.partial().parse(req.body);
        if (!dentroArea(body.lat ?? before.lat, body.lon ?? before.lon)) {
          throw new HttpError(400, 'COORDENADAS_FUERA_AREA', 'Coordenadas fuera del área de influencia de Ciudad Granada');
        }
        const updated = await deps.lugares.updateLugar(id, body);
        await deps.admin.audit({ usuario: adminName(req), accion: 'editar', entidad: 'lugar', entidadId: id, antes: JSON.stringify(before), despues: JSON.stringify(updated) });
        res.json(updated);
      } catch (error) {
        next(error instanceof z.ZodError ? invalidData(error) : error);
      }
    },
    remove: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID_INVALIDO', 'Identificador inválido');
        const before = await deps.lugares.findLugarAdmin(id);
        if (!before) throw new HttpError(404, 'LUGAR_NO_ENCONTRADO', 'El lugar no existe');
        const deleted = await deps.lugares.deleteLugar(id);
        if (!deleted) throw new HttpError(404, 'LUGAR_NO_ENCONTRADO', 'El lugar no existe');
        await deps.admin.audit({ usuario: adminName(req), accion: 'eliminar', entidad: 'lugar', entidadId: id, antes: JSON.stringify(before), despues: null });
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
    audit: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        res.json(await deps.admin.listAudit());
      } catch (error) {
        next(error);
      }
    }
  };
}

async function categoriaCodigo(lugares: LugarRepository, categoriaId: number): Promise<string> {
  const categorias = await lugares.listCategorias();
  const categoria = categorias.find((item) => item.id === categoriaId);
  if (!categoria) throw new HttpError(400, 'CATEGORIA_INVALIDA', 'Categoría inválida');
  return categoria.codigo;
}