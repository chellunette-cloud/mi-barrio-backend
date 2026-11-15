import type { Pool } from 'pg';
import type { Barrio, BarrioGeometria, BarrioRepository } from '../../domain/barrio/types.js';
import { BARRIO_SLUG } from '../../domain/barrio/constants.js';
import { BARRIO_SQL, FUENTES_SQL, GEOMETRIA_SQL } from './queries/barrioQueries.js';
import type { BarrioRow, FuenteRow, GeometriaRow } from './queries/rowTypes.js';
import { mapBarrio } from './mappers/mapBarrio.js';
import { mapGeometria } from './mappers/mapGeometria.js';

export class PostgresBarrioRepository implements BarrioRepository {
  constructor(private readonly pool: Pool) {}

  async findBarrio(): Promise<Barrio | null> {
    const result = await this.pool.query<BarrioRow>(BARRIO_SQL, [BARRIO_SLUG]);
    const row = result.rows[0];
    if (!row) return null;
    const fuentes = await this.pool.query<FuenteRow>(FUENTES_SQL, [BARRIO_SLUG]);
    return mapBarrio(row, fuentes.rows);
  }

  async findGeometria(): Promise<BarrioGeometria | null> {
    const result = await this.pool.query<GeometriaRow>(GEOMETRIA_SQL, [BARRIO_SLUG]);
    const row = result.rows[0];
    if (!row) return null;
    const fuentes = await this.pool.query<FuenteRow>(FUENTES_SQL, [BARRIO_SLUG]);
    return mapGeometria(row, fuentes.rows);
  }
}
