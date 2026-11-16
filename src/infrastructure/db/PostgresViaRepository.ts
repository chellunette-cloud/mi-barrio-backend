import type { Pool } from 'pg';
import type { Via, ViaRepository } from '../../domain/vias/types.js';

export class PostgresViaRepository implements ViaRepository {
  constructor(private readonly pool: Pool) {}

  async listVias(highway?: string): Promise<Via[]> {
    const result = await this.pool.query<{
      id: number;
      nombre: string | null;
      highway: string;
      geojson: string;
      dentro_barrio: boolean;
      fuente_principal: string;
    }>(
      `SELECT id, nombre, highway, ST_AsGeoJSON(geom) AS geojson,
              dentro_barrio, fuente_principal
       FROM via
       WHERE ($1::text IS NULL OR highway = $1)
       ORDER BY id`,
      [highway ?? null]
    );
    return result.rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      highway: row.highway,
      coordenadas: (JSON.parse(row.geojson) as { coordinates: number[][] }).coordinates,
      dentroBarrio: row.dentro_barrio,
      fuentePrincipal: row.fuente_principal
    }));
  }
}