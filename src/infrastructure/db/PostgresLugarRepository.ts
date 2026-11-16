import type { Pool } from 'pg';
import type { Categoria, Lugar, LugarFiltro, LugarRepository } from '../../domain/places/types.js';
import { CATEGORIAS_SQL, LUGARES_SQL, LUGAR_SQL } from './queries/lugarQueries.js';
import type { CategoriaRow, LugarRow } from './queries/rowTypes.js';
import { mapCategoria, mapLugar } from './mappers/mapLugar.js';

export class PostgresLugarRepository implements LugarRepository {
  constructor(private readonly pool: Pool) {}

  async listCategorias(): Promise<Categoria[]> {
    const result = await this.pool.query<CategoriaRow>(CATEGORIAS_SQL);
    return result.rows.map(mapCategoria);
  }

  async listLugares(filtro: LugarFiltro): Promise<Lugar[]> {
    const busqueda = filtro.q ? `%${filtro.q}%` : null;
    const limite = Math.min(Math.max(filtro.limite ?? 500, 1), 1000);
    const result = await this.pool.query<LugarRow>(LUGARES_SQL, [
      filtro.categoria ?? null,
      busqueda,
      limite
    ]);
    return result.rows.map(mapLugar);
  }

  async findLugar(id: number): Promise<Lugar | null> {
    const result = await this.pool.query<LugarRow>(LUGAR_SQL, [id]);
    const row = result.rows[0];
    return row ? mapLugar(row) : null;
  }
}