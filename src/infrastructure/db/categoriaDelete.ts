import type { Pool } from 'pg';
import type { CategoriaDeleteResult } from '../../domain/places/types.js';
import {
  CATEGORIA_DESTINO_SQL,
  CATEGORIA_LOCK_SQL,
  DELETE_CATEGORIA_SQL,
  LUGARES_CATEGORIA_COUNT_SQL,
  REASIGNAR_LUGARES_SQL
} from './queries/categoriaAdminQueries.js';
import type { CategoriaRow } from './queries/rowTypes.js';

export async function deleteCategoria(
  pool: Pool,
  id: number,
  reasignarA?: number
): Promise<CategoriaDeleteResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const locked = await client.query<CategoriaRow>(CATEGORIA_LOCK_SQL, [id]);
    if (!locked.rows[0]) {
      await client.query('ROLLBACK');
      return { status: 'not_found', lugares: 0 };
    }
    const count = await client.query<{ total: number }>(LUGARES_CATEGORIA_COUNT_SQL, [id]);
    const lugares = count.rows[0]?.total ?? 0;
    if (lugares > 0) {
      if (!reasignarA || reasignarA === id) {
        await client.query('ROLLBACK');
        return { status: reasignarA ? 'invalid_target' : 'has_places', lugares };
      }
      const target = await client.query(CATEGORIA_DESTINO_SQL, [reasignarA]);
      if (!target.rows[0]) {
        await client.query('ROLLBACK');
        return { status: 'invalid_target', lugares };
      }
      await client.query(REASIGNAR_LUGARES_SQL, [reasignarA, id]);
    }
    await client.query(DELETE_CATEGORIA_SQL, [id]);
    await client.query('COMMIT');
    return { status: 'deleted', lugares };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
