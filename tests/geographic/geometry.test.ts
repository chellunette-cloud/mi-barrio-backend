import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { databaseUrl } from '../../src/config/database.js';

const pool = new Pool({ connectionString: databaseUrl });
const sourcePath = join(process.cwd(), 'data/source/barrio-ciudad-granada.geojson');

afterAll(async () => {
  await pool.end();
});

describe('Integridad geográfica', () => {
  it('valida geometría, SRID, snapshot, centroide y manzanas', async () => {
    const raw = JSON.parse((await readFile(sourcePath, 'utf8')).replace(/^\uFEFF/, '')) as {
      features: { geometry: unknown }[];
    };
    const geojson = JSON.stringify(raw.features[0]?.geometry);
    const result = await pool.query<{
      valida: boolean; srid: number; vertices: number; coincide: boolean; centroide_m: number;
      manzanas: number; estrato2: number; fuera: number; invalidas: number;
    }>(
      `SELECT ST_IsValid(b.geom) AS valida, ST_SRID(b.geom)::int AS srid,
        ST_NPoints(b.geom)::int AS vertices,
        ST_Equals(b.geom, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) AS coincide,
        ST_Distance(b.centroide::geography,
          ST_SetSRID(ST_MakePoint(-74.171758, 4.641833), 4326)::geography)::float8 AS centroide_m,
        count(m.*)::int AS manzanas,
        count(m.*) FILTER (WHERE m.estrato = 2)::int AS estrato2,
        count(m.*) FILTER (WHERE NOT ST_Contains(b.geom, ST_Centroid(m.geom)))::int AS fuera,
        count(m.*) FILTER (WHERE NOT ST_IsValid(m.geom))::int AS invalidas
       FROM barrio b LEFT JOIN manzana_estrato m ON m.barrio_id = b.id
       GROUP BY b.id`,
      [geojson]
    );
    const row = result.rows[0];
    expect(row?.valida).toBe(true);
    expect(row?.srid).toBe(4326);
    expect(row?.vertices).toBe(58);
    expect(row?.coincide).toBe(true);
    expect(row?.centroide_m).toBeLessThanOrEqual(5);
    expect(row?.manzanas).toBe(34);
    expect(row?.estrato2).toBe(34);
    expect(row?.fuera).toBe(0);
    expect(row?.invalidas).toBe(0);
  });
});
